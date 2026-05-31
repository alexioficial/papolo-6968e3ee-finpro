import { fail, redirect } from '@sveltejs/kit';
import { Category } from '$lib/server/models/Category';
import { requireRole } from '$lib/server/authorize';
import { logAudit } from '$lib/server/services/audit.service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireRole(['admin', 'contador'], locals.user?.role);
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		requireRole(['admin', 'contador'], locals.user?.role);
		const tenantId = locals.user!.tenantId;

		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const type = formData.get('type') as string;
		const color = (formData.get('color') as string)?.trim() || '#3b82f6';

		if (!name) return fail(400, { error: 'El nombre es requerido', name: '' });
		if (!['income', 'expense'].includes(type)) {
			return fail(400, { error: 'Tipo invalido', name });
		}

		const existing = await Category.findOne({ tenantId, name, type });
		if (existing) {
			return fail(409, { error: `Ya existe una categoria de ${type} con ese nombre`, name });
		}

		const category = await Category.create({ tenantId, name, type, color });

		await logAudit({
			tenantId,
			userId: locals.user!.id,
			action: 'create',
			entityType: 'category',
			entityId: category._id.toString(),
			newValue: { name, type, color }
		});

		throw redirect(302, '/app/categories');
	}
};
