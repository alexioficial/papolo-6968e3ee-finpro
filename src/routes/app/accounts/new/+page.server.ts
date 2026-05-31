import { fail, redirect } from '@sveltejs/kit';
import { Account } from '$lib/server/models/Account';
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
		const balance = parseFloat(formData.get('balance') as string) || 0;
		const currency = (formData.get('currency') as string)?.trim() || 'ARS';

		if (!name) return fail(400, { error: 'El nombre es requerido', name: '' });
		if (!['bank', 'cash', 'credit_card', 'investment'].includes(type)) {
			return fail(400, { error: 'Tipo de cuenta invalido', name });
		}

		const existing = await Account.findOne({ tenantId, name });
		if (existing) {
			return fail(409, { error: 'Ya existe una cuenta con ese nombre', name });
		}

		const account = await Account.create({ tenantId, name, type, balance, currency });

		await logAudit({
			tenantId,
			userId: locals.user!.id,
			action: 'create',
			entityType: 'account',
			entityId: account._id.toString(),
			newValue: { name, type, balance, currency }
		});

		throw redirect(302, '/app/accounts');
	}
};
