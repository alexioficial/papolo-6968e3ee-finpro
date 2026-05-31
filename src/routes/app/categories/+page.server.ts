import { Category } from '$lib/server/models/Category';
import { canWrite } from '$lib/server/authorize';
import { serialize } from '$lib/server/serialize';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.user!.tenantId;
	const categories = await Category.find({ tenantId }).sort({ type: 1, name: 1 }).lean();
	return serialize({ categories, canWrite: canWrite(locals.user!.role) });
};
