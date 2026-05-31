import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';

interface ReportFilters {
	tenantId: string;
	startDate?: Date;
	endDate?: Date;
	accountId?: string;
	categoryId?: string;
	type?: 'income' | 'expense';
}

export async function getDashboardSummary(tenantId: string) {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

	const [monthlyTotals, totalIncome, totalExpenses, recentTransactions] = await Promise.all([
		Transaction.aggregate([
			{ $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
			{
				$group: {
					_id: null,
					monthlyIncome: {
						$sum: {
							$cond: [
								{ $and: [{ $eq: ['$type', 'income'] }, { $gte: ['$date', startOfMonth] }, { $lte: ['$date', endOfMonth] }] },
								'$amount',
								0
							]
						}
					},
					monthlyExpenses: {
						$sum: {
							$cond: [
								{ $and: [{ $eq: ['$type', 'expense'] }, { $gte: ['$date', startOfMonth] }, { $lte: ['$date', endOfMonth] }] },
								'$amount',
								0
							]
						}
					},
					totalIncome: {
						$sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
					},
					totalExpenses: {
						$sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
					},
					count: { $sum: 1 }
				}
			}
		]),
		Transaction.aggregate([
			{ $match: { tenantId: new mongoose.Types.ObjectId(tenantId), type: 'income' } },
			{ $group: { _id: null, total: { $sum: '$amount' } } }
		]),
		Transaction.aggregate([
			{ $match: { tenantId: new mongoose.Types.ObjectId(tenantId), type: 'expense' } },
			{ $group: { _id: null, total: { $sum: '$amount' } } }
		]),
		Transaction.find({ tenantId })
			.sort({ date: -1 })
			.limit(5)
			.populate('categoryId', 'name color')
			.populate('accountId', 'name')
			.lean()
	]);

	const summary =
		monthlyTotals[0] || { monthlyIncome: 0, monthlyExpenses: 0, totalIncome: 0, totalExpenses: 0, count: 0 };

	return {
		monthlyIncome: summary.monthlyIncome,
		monthlyExpenses: summary.monthlyExpenses,
		monthlyBalance: summary.monthlyIncome - summary.monthlyExpenses,
		totalIncome: totalIncome[0]?.total || 0,
		totalExpenses: totalExpenses[0]?.total || 0,
		totalBalance: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
		transactionCount: summary.count,
		recentTransactions
	};
}

export async function getMonthlyTrends(tenantId: string, months = 6) {
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - months);

	return Transaction.aggregate([
		{
			$match: {
				tenantId: new mongoose.Types.ObjectId(tenantId),
				date: { $gte: startDate }
			}
		},
		{
			$group: {
				_id: {
					year: { $year: '$date' },
					month: { $month: '$date' },
					type: '$type'
				},
				total: { $sum: '$amount' },
				count: { $sum: 1 }
			}
		},
		{ $sort: { '_id.year': 1, '_id.month': 1 } }
	]);
}

export async function getCategoryBreakdown(
	tenantId: string,
	type: 'income' | 'expense',
	filters?: ReportFilters
) {
	const match: Record<string, unknown> = {
		tenantId: new mongoose.Types.ObjectId(tenantId),
		type
	};

	if (filters?.startDate || filters?.endDate) {
		match.date = {};
		if (filters.startDate) match.date.$gte = filters.startDate;
		if (filters.endDate) match.date.$lte = filters.endDate;
	}
	if (filters?.accountId) match.accountId = new mongoose.Types.ObjectId(filters.accountId);

	return Transaction.aggregate([
		{ $match: match },
		{
			$lookup: {
				from: 'categories',
				localField: 'categoryId',
				foreignField: '_id',
				as: 'category'
			}
		},
		{ $unwind: '$category' },
		{
			$group: {
				_id: { id: '$categoryId', name: '$category.name', color: '$category.color' },
				total: { $sum: '$amount' },
				count: { $sum: 1 }
			}
		},
		{ $sort: { total: -1 } }
	]);
}

export async function getDetailedReport(
	tenantId: string,
	filters: ReportFilters & { page?: number; limit?: number }
) {
	const { page = 1, limit = 50, startDate, endDate, accountId, categoryId, type } = filters;

	const match: Record<string, unknown> = { tenantId: new mongoose.Types.ObjectId(tenantId) };

	if (startDate || endDate) {
		match.date = {};
		if (startDate) match.date.$gte = startDate;
		if (endDate) match.date.$lte = endDate;
	}
	if (accountId) match.accountId = new mongoose.Types.ObjectId(accountId);
	if (categoryId) match.categoryId = new mongoose.Types.ObjectId(categoryId);
	if (type) match.type = type;

	const [data, total] = await Promise.all([
		Transaction.aggregate([
			{ $match: match },
			{
				$lookup: {
					from: 'categories',
					localField: 'categoryId',
					foreignField: '_id',
					as: 'category'
				}
			},
			{ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: 'accounts',
					localField: 'accountId',
					foreignField: '_id',
					as: 'account'
				}
			},
			{ $unwind: { path: '$account', preserveNullAndEmptyArrays: true } },
			{ $sort: { date: -1 } },
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
			{
				$project: {
					date: 1,
					type: 1,
					amount: 1,
					description: 1,
					reference: 1,
					'category.name': 1,
					'category.color': 1,
					'account.name': 1
				}
			}
		]),
		Transaction.countDocuments(match)
	]);

	const totals = await Transaction.aggregate([
		{ $match: match },
		{
			$group: {
				_id: null,
				totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
				totalExpenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
				count: { $sum: 1 }
			}
		}
	]);

	const summary = totals[0] || { totalIncome: 0, totalExpenses: 0, count: 0 };

	return {
		data,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		summary: {
			totalIncome: summary.totalIncome,
			totalExpenses: summary.totalExpenses,
			balance: summary.totalIncome - summary.totalExpenses,
			totalTransactions: summary.count
		}
	};
}
