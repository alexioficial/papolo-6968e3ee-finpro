import { Account } from '$lib/server/models/Account';
import { canWrite, requireRole } from '$lib/server/authorize';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.user!.tenantId;
	const accounts = await Account.find({ tenantId }).sort({ isActive: -1, name: 1 }).lean();

	return { accounts, canWrite: canWrite(locals.user!.role) };
};
