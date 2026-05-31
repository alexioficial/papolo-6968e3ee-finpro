import { Account } from '$lib/server/models/Account';
import { Transaction } from '$lib/server/models/Transaction';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.user!.tenantId;

	try {
		// Step 1: just get accounts
		const accounts = await Account.find({ tenantId, isActive: true }).lean();

		// Step 2: just get transactions (no populate)
		const transactions = await Transaction.find({ tenantId }).sort({ date: -1 }).limit(5).lean();

		// Step 3: return basic data
		const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

		return {
			summary: {
				monthlyIncome: 0,
				monthlyExpenses: 0,
				monthlyBalance: 0,
				totalIncome: 0,
				totalExpenses: 0,
				totalBalance: 0,
				transactionCount: transactions.length,
				recentTransactions: transactions
			},
			accounts,
			totalBalance
		};
	} catch (err: any) {
		console.error('Dashboard error:', err?.message || err);
		throw error(500, 'Error: ' + (err?.message || 'unknown'));
	}
};
