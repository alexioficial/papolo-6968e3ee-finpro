import { redirect } from '@sveltejs/kit';
import { requireRole } from '$lib/server/authorize';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');
	requireRole(['admin'], locals.user.role);
	return { user: locals.user, tenant: locals.tenant };
};
