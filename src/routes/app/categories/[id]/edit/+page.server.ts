import { fail, redirect, error } from '@sveltejs/kit';
import { Category } from '$lib/server/models/Category';
import { requireRole } from '$lib/server/authorize';
import { logAudit } from '$lib/server/services/audit.service';
import { serialize } from '$lib/server/serialize';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireRole(['admin', 'contador'], locals.user?.role);
	const category = await Category.findOne({ _id: params.id, tenantId: locals.user!.tenantId }).lean();
	if (!category) throw error(404, 'Categoria no encontrada');
	return serialize({ category });
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		requireRole(['admin', 'contador'], locals.user?.role);
		const tenantId = locals.user!.tenantId;
		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const type = formData.get('type') as string;
		const color = (formData.get('color') as string)?.trim() || '#3b82f6';
		if (!name) return fail(400, { error: 'El nombre es requerido' });
		const existing = await Category.findOne({ tenantId, name, type, _id: { $ne: params.id } });
		if (existing) return fail(409, { error: 'Ya existe otra categoria con ese nombre y tipo' });
		const category = await Category.findOneAndUpdate(
			{ _id: params.id, tenantId },
			{ $set: { name, type, color } },
			{ new: true }
		);
		if (!category) return fail(404, { error: 'Categoria no encontrada' });
		await logAudit({ tenantId, userId: locals.user!.id, action: 'update', entityType: 'category', entityId: category._id.toString(), newValue: { name, type, color } });
		throw redirect(302, '/app/categories');
	}
};
