import { fail, redirect, error } from '@sveltejs/kit';
import { Account } from '$lib/server/models/Account';
import { requireRole } from '$lib/server/authorize';
import { logAudit } from '$lib/server/services/audit.service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireRole(['admin', 'contador'], locals.user?.role);
	const account = await Account.findOne({ _id: params.id, tenantId: locals.user!.tenantId }).lean();
	if (!account) throw error(404, 'Cuenta no encontrada');
	return { account };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		requireRole(['admin', 'contador'], locals.user?.role);
		const tenantId = locals.user!.tenantId;

		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const type = formData.get('type') as string;
		const currency = (formData.get('currency') as string)?.trim() || 'ARS';

		if (!name) return fail(400, { error: 'El nombre es requerido' });

		const account = await Account.findOne({ _id: params.id, tenantId });
		if (!account) return fail(404, { error: 'Cuenta no encontrada' });

		const existing = await Account.findOne({ tenantId, name, _id: { $ne: params.id } });
		if (existing) return fail(409, { error: 'Ya existe otra cuenta con ese nombre' });

		const oldValue = { name: account.name, type: account.type, currency: account.currency };

		account.name = name;
		account.type = type as typeof account.type;
		account.currency = currency;
		await account.save();

		await logAudit({
			tenantId,
			userId: locals.user!.id,
			action: 'update',
			entityType: 'account',
			entityId: account._id.toString(),
			oldValue: oldValue as any,
			newValue: { name, type, currency }
		});

		throw redirect(302, '/app/accounts');
	}
};
