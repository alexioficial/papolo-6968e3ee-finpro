import { getDashboardSummary } from '$lib/server/services/report.service';
import { Account } from '$lib/server/models/Account';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.user!.tenantId;

	try {
		const [summary, accounts] = await Promise.all([
			getDashboardSummary(tenantId),
			Account.find({ tenantId, isActive: true }).lean()
		]);

		const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

		return {
			summary,
			accounts,
			totalBalance
		};
	} catch (err) {
		console.error('Dashboard load error:', err);
		throw error(500, 'Error al cargar el dashboard');
	}
};
