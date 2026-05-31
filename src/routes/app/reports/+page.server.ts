import { getDetailedReport } from '$lib/server/services/report.service';
import { Account } from '$lib/server/models/Account';
import { Category } from '$lib/server/models/Category';
import { serialize } from '$lib/server/serialize';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const tenantId = locals.user!.tenantId;
	const type = url.searchParams.get('type') || undefined;
	const accountId = url.searchParams.get('account') || undefined;
	const categoryId = url.searchParams.get('category') || undefined;
	const startDate = url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined;
	const endDate = url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined;

	const filters = { tenantId, startDate, endDate, accountId, categoryId, type: type as any };

	const [report, accounts, categories] = await Promise.all([
		getDetailedReport(tenantId, { ...filters, page: 1, limit: 100 }),
		Account.find({ tenantId, isActive: true }).select('name').lean(),
		Category.find({ tenantId, isActive: true }).select('name type color').lean()
	]);

	return serialize({ report, accounts, categories, filters: { type, accountId, categoryId, startDate, endDate } });
};
