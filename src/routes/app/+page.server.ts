import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401, 'No autorizado');

	return {
		summary: {
			monthlyIncome: 1500000,
			monthlyExpenses: 770000,
			monthlyBalance: 730000,
			totalIncome: 5000000,
			totalExpenses: 3200000,
			totalBalance: 1800000,
			transactionCount: 8,
			recentTransactions: [
				{
					_id: '1',
					description: 'Demo transaction',
					amount: 450000,
					type: 'income',
					date: new Date(),
					categoryId: { name: 'Ventas', color: '#22c55e' },
					accountId: { name: 'Banco Principal' }
				}
			]
		},
		accounts: [
			{ _id: '1', name: 'Banco Principal', type: 'bank', balance: 1500000 },
			{ _id: '2', name: 'Caja Chica', type: 'cash', balance: 50000 }
		],
		totalBalance: 1550000
	};
};
