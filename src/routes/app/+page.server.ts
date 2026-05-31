import { Account } from '$lib/server/models/Account';
import { Transaction } from '$lib/server/models/Transaction';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.user!.tenantId;

	try {
		console.log('Dashboard load - tenantId:', tenantId);

		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

		console.log('Fetching accounts...');
		const accounts = await Account.find({ tenantId, isActive: true }).lean();
		console.log('Accounts found:', accounts.length);

		console.log('Fetching all transactions...');
		const allTransactions = await Transaction.find({ tenantId }).lean();
		console.log('Transactions found:', allTransactions.length);

		console.log('Fetching recent transactions with populate...');
		const recentTransactions = await Transaction.find({ tenantId })
			.sort({ date: -1 })
			.limit(5)
			.populate('categoryId', 'name color')
			.populate('accountId', 'name')
			.lean();
		console.log('Recent transactions:', recentTransactions.length);

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

		const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

		console.log('Dashboard loaded successfully');

		return {
			summary: {
				monthlyIncome,
				monthlyExpenses,
				monthlyBalance: monthlyIncome - monthlyExpenses,
				totalIncome,
				totalExpenses,
				totalBalance: totalIncome - totalExpenses,
				transactionCount: allTransactions.length,
				recentTransactions
			},
			accounts,
			totalBalance
		};
	} catch (err: any) {
		console.error('Dashboard load error:', err);
		console.error('  message:', err.message);
		console.error('  stack:', err.stack?.split('\n').slice(0, 5).join('\n'));
		throw error(500, 'Error al cargar el dashboard: ' + (err.message || 'unknown'));
	}
};
