import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Basic check: return minimal data
	return {
		user: {
			id: locals.user.id,
			tenantId: locals.user.tenantId,
			email: locals.user.email,
			name: locals.user.name,
			role: locals.user.role
		},
		tenant: locals.tenant ? {
			id: locals.tenant.id,
			name: locals.tenant.name,
			slug: locals.tenant.slug,
			plan: locals.tenant.plan
		} : null
	};
};
