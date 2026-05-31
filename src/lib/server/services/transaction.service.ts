import mongoose from 'mongoose';
import { Transaction, type ITransaction } from '../models/Transaction';
import { Account } from '../models/Account';
import { error } from '@sveltejs/kit';

interface CreateTransactionInput {
	tenantId: string;
	accountId: string;
	categoryId: string;
	type: 'income' | 'expense';
	amount: number;
	description: string;
	date: Date;
	isScheduled?: boolean;
	reference?: string;
	createdBy: string;
}

interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
	isReconciled?: boolean;
}

export async function createTransaction(input: CreateTransactionInput): Promise<ITransaction> {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		// Validate account belongs to tenant
		const account = await Account.findOne({
			_id: input.accountId,
			tenantId: input.tenantId,
			isActive: true
		}).session(session);

		if (!account) {
			throw error(400, 'Cuenta no encontrada o inactiva');
		}

		// Create transaction
		const [transaction] = await Transaction.create(
			[
				{
					tenantId: input.tenantId,
					accountId: input.accountId,
					categoryId: input.categoryId,
					type: input.type,
					amount: input.amount,
					description: input.description,
					date: input.date,
					isScheduled: input.isScheduled ?? false,
					reference: input.reference ?? null,
					createdBy: input.createdBy
				}
			],
			{ session }
		);

		// Update account balance
		const balanceChange = input.type === 'income' ? input.amount : -input.amount;
		const updatedAccount = await Account.findByIdAndUpdate(
			input.accountId,
			{ $inc: { balance: balanceChange } },
			{ new: true, session }
		);

		if (!updatedAccount) {
			throw new Error('Failed to update account balance');
		}

		await session.commitTransaction();
		return transaction;
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		session.endSession();
	}
}

export async function updateTransaction(
	transactionId: string,
	tenantId: string,
	input: UpdateTransactionInput
): Promise<ITransaction> {
	const existing = await Transaction.findOne({ _id: transactionId, tenantId });
	if (!existing) {
		throw error(404, 'Transaccion no encontrada');
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		// Revert old balance change
		const oldBalanceChange = existing.type === 'income' ? -existing.amount : existing.amount;
		await Account.findByIdAndUpdate(
			existing.accountId,
			{ $inc: { balance: oldBalanceChange } },
			{ session }
		);

		// Apply new values
		const newType = input.type ?? existing.type;
		const newAmount = input.amount ?? existing.amount;
		const newAccountId = input.accountId ?? existing.accountId.toString();

		const newBalanceChange = newType === 'income' ? newAmount : -newAmount;
		await Account.findByIdAndUpdate(
			newAccountId,
			{ $inc: { balance: newBalanceChange } },
			{ session }
		);

		const updated = await Transaction.findByIdAndUpdate(
			transactionId,
			{
				$set: {
					...input,
					...(input.accountId ? { accountId: input.accountId } : {})
				}
			},
			{ new: true, session }
		);

		await session.commitTransaction();
		return updated!;
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		session.endSession();
	}
}

export async function deleteTransaction(
	transactionId: string,
	tenantId: string
): Promise<void> {
	const existing = await Transaction.findOne({ _id: transactionId, tenantId });
	if (!existing) {
		throw error(404, 'Transaccion no encontrada');
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		// Revert balance
		const balanceChange = existing.type === 'income' ? -existing.amount : existing.amount;
		await Account.findByIdAndUpdate(
			existing.accountId,
			{ $inc: { balance: balanceChange } },
			{ session }
		);

		await Transaction.findByIdAndDelete(transactionId, { session });

		await session.commitTransaction();
	} catch (err) {
		await session.abortTransaction();
		throw err;
	} finally {
		session.endSession();
	}
}

export async function getTransactions(
	tenantId: string,
	options: {
		page?: number;
		limit?: number;
		accountId?: string;
		categoryId?: string;
		type?: 'income' | 'expense';
		startDate?: Date;
		endDate?: Date;
		search?: string;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	} = {}
) {
	const {
		page = 1,
		limit = 20,
		accountId,
		categoryId,
		type,
		startDate,
		endDate,
		search,
		sortBy = 'date',
		sortOrder = 'desc'
	} = options;

	const filter: Record<string, unknown> = { tenantId };

	if (accountId) filter.accountId = accountId;
	if (categoryId) filter.categoryId = categoryId;
	if (type) filter.type = type;
	if (startDate || endDate) {
		filter.date = {};
		if (startDate) filter.date.$gte = startDate;
		if (endDate) filter.date.$lte = endDate;
	}
	if (search) {
		filter.$text = { $search: search };
	}

	const sortField = sortBy === 'amount' ? 'amount' : 'date';

	const [transactions, total] = await Promise.all([
		Transaction.find(filter)
			.sort({ [sortField]: sortOrder === 'desc' ? -1 : 1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.populate('accountId', 'name type')
			.populate('categoryId', 'name color')
			.populate('createdBy', 'name')
			.lean(),
		Transaction.countDocuments(filter)
	]);

	return {
		transactions,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit)
		}
	};
}
