import { Account } from '$lib/server/models/Account';
import { canWrite } from '$lib/server/authorize';
import { serialize } from '$lib/server/serialize';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.user!.tenantId;
	const accounts = await Account.find({ tenantId }).sort({ isActive: -1, name: 1 }).lean();
	return serialize({ accounts, canWrite: canWrite(locals.user!.role) });
};
