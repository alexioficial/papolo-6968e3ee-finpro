import { Account } from '$lib/server/models/Account';
import { Transaction } from '$lib/server/models/Transaction';
import { Category } from '$lib/server/models/Category';
import type { PageServerLoad } from './$types';

// Category import is needed for Transaction.populate('categoryId') to work

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.user!.tenantId;

	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

	const [accounts, allTransactions, recentTransactions] = await Promise.all([
		Account.find({ tenantId, isActive: true }).lean(),
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

	const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

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
};
