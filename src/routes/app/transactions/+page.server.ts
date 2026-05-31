import { getTransactions } from '$lib/server/services/transaction.service';
import { Account } from '$lib/server/models/Account';
import { Category } from '$lib/server/models/Category';
import { canWrite } from '$lib/server/authorize';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const tenantId = locals.user!.tenantId;

	const page = parseInt(url.searchParams.get('page') || '1');
	const type = url.searchParams.get('type') || undefined;
	const accountId = url.searchParams.get('account') || undefined;
	const categoryId = url.searchParams.get('category') || undefined;
	const startDate = url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined;
	const endDate = url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined;
	const search = url.searchParams.get('q') || undefined;

	const [result, accounts, categories] = await Promise.all([
		getTransactions(tenantId, {
			page,
			limit: 20,
			type: type as any,
			accountId,
			categoryId,
			startDate,
			endDate,
			search
		}),
		Account.find({ tenantId, isActive: true }).select('name type').lean(),
		Category.find({ tenantId, isActive: true }).select('name type color').lean()
	]);

	return {
		transactions: result.transactions,
		pagination: result.pagination,
		accounts,
		categories,
		filters: { type, accountId, categoryId, startDate, endDate, search, page },
		canWrite: canWrite(locals.user!.role)
	};
};
