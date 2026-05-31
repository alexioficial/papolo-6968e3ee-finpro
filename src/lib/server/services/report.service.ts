import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';

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

	try {
		const [allTransactions, recentTransactions] = await Promise.all([
			Transaction.find({ tenantId }).lean(),
			Transaction.find({ tenantId })
				.sort({ date: -1 })
				.limit(5)
				.populate('categoryId', 'name color')
				.populate('accountId', 'name')
				.lean()
		]);

		let monthlyIncome = 0;
		let monthlyExpenses = 0;
		let totalIncome = 0;
		let totalExpenses = 0;

		for (const t of allTransactions) {
			const tDate = new Date(t.date);
			const isThisMonth = tDate >= startOfMonth && tDate <= endOfMonth;

			if (t.type === 'income') {
				totalIncome += t.amount;
				if (isThisMonth) monthlyIncome += t.amount;
			} else {
				totalExpenses += t.amount;
				if (isThisMonth) monthlyExpenses += t.amount;
			}
		}

		return {
			monthlyIncome,
			monthlyExpenses,
			monthlyBalance: monthlyIncome - monthlyExpenses,
			totalIncome,
			totalExpenses,
			totalBalance: totalIncome - totalExpenses,
			transactionCount: allTransactions.length,
			recentTransactions
		};
	} catch (err) {
		console.error('getDashboardSummary error:', err);
		return {
			monthlyIncome: 0,
			monthlyExpenses: 0,
			monthlyBalance: 0,
			totalIncome: 0,
			totalExpenses: 0,
			totalBalance: 0,
			transactionCount: 0,
			recentTransactions: []
		};
	}
}

export async function getMonthlyTrends(tenantId: string, months = 6) {
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - months);

	return Transaction.aggregate([
		{
			$match: {
				tenantId,
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
	const match: Record<string, unknown> = { tenantId, type };
	if (filters?.startDate || filters?.endDate) {
		match.date = {};
		if (filters.startDate) match.date.$gte = filters.startDate;
		if (filters.endDate) match.date.$lte = filters.endDate;
	}
	if (filters?.accountId) match.accountId = filters.accountId;

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

	const match: Record<string, unknown> = { tenantId };
	if (startDate || endDate) {
		match.date = {};
		if (startDate) match.date.$gte = startDate;
		if (endDate) match.date.$lte = endDate;
	}
	if (accountId) match.accountId = accountId;
	if (categoryId) match.categoryId = categoryId;
	if (type) match.type = type;

	try {
		const [data, total, totals] = await Promise.all([
			Transaction.find(match)
				.sort({ date: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.populate('categoryId', 'name color')
				.populate('accountId', 'name')
				.lean(),
			Transaction.countDocuments(match),
			Transaction.aggregate([
				{ $match: match },
				{
					$group: {
						_id: null,
						totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
						totalExpenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
						count: { $sum: 1 }
					}
				}
			])
		]);

		const summary = totals[0] || { totalIncome: 0, totalExpenses: 0, count: 0 };

		// Transform populated data to match expected shape
		const transformed = data.map((r: any) => ({
			...r,
			category: r.categoryId || null,
			account: r.accountId || null
		}));

		return {
			data: transformed,
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
			summary: {
				totalIncome: summary.totalIncome,
				totalExpenses: summary.totalExpenses,
				balance: summary.totalIncome - summary.totalExpenses,
				totalTransactions: summary.count
			}
		};
	} catch (err) {
		console.error('getDetailedReport error:', err);
		return {
			data: [],
			pagination: { page, limit, total: 0, totalPages: 0 },
			summary: { totalIncome: 0, totalExpenses: 0, balance: 0, totalTransactions: 0 }
		};
	}
}
