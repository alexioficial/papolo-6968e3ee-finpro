import { Category } from '$lib/server/models/Category';
import { canWrite } from '$lib/server/authorize';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.user!.tenantId;
	const categories = await Category.find({ tenantId }).sort({ type: 1, name: 1 }).lean();

	return { categories, canWrite: canWrite(locals.user!.role) };
};
