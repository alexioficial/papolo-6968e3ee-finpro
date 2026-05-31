import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Test which model import breaks
import '../lib/server/models/Account';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401, 'No autorizado');
	return { summary: { monthlyIncome: 0, monthlyExpenses: 0, monthlyBalance: 0, totalIncome: 0, totalExpenses: 0, totalBalance: 0, transactionCount: 0, recentTransactions: [] }, accounts: [], totalBalance: 0 };
};
