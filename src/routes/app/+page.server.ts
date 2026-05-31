import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Just return hardcoded data - NO model imports
	if (!locals.user) {
		throw error(401, 'No autorizado');
	}

	return {
		summary: {
			monthlyIncome: 1500000,
			monthlyExpenses: 770000,
			monthlyBalance: 730000,
			totalIncome: 5000000,
			totalExpenses: 3200000,
			totalBalance: 1800000,
			transactionCount: 8,
			recentTransactions: []
		},
		accounts: [],
		totalBalance: 0
	};
};
