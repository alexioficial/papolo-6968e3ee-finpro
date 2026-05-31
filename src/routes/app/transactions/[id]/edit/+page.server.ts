import { fail, redirect, error } from '@sveltejs/kit';
import { Transaction } from '$lib/server/models/Transaction';
import { Account } from '$lib/server/models/Account';
import { Category } from '$lib/server/models/Category';
import { requireRole } from '$lib/server/authorize';
import { updateTransaction } from '$lib/server/services/transaction.service';
import { logAudit } from '$lib/server/services/audit.service';
import { serialize } from '$lib/server/serialize';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireRole(['admin', 'contador'], locals.user?.role);
	const tenantId = locals.user!.tenantId;

	const transaction = await Transaction.findOne({ _id: params.id, tenantId })
		.populate('accountId', 'name')
		.populate('categoryId', 'name')
		.lean();

	if (!transaction) throw error(404, 'Transaccion no encontrada');

	const [accounts, categories] = await Promise.all([
		Account.find({ tenantId, isActive: true }).select('name type balance').lean(),
		Category.find({ tenantId, isActive: true }).select('name type color').lean()
	]);

	return serialize({ transaction, accounts, categories });
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		requireRole(['admin', 'contador'], locals.user?.role);
		const tenantId = locals.user!.tenantId;

		const formData = await request.formData();
		const type = formData.get('type') as string;
		const accountId = formData.get('accountId') as string;
		const categoryId = formData.get('categoryId') as string;
		const amount = parseFloat(formData.get('amount') as string);
		const description = (formData.get('description') as string)?.trim();
		const dateStr = formData.get('date') as string;
		const reference = (formData.get('reference') as string)?.trim() || '';

		if (!description || description.length < 3) {
			return fail(400, { error: 'La descripcion debe tener al menos 3 caracteres' });
		}

		try {
			const updated = await updateTransaction(params.id, tenantId, {
				type: type as any, accountId, categoryId, amount, description,
				date: new Date(dateStr), reference: reference || undefined
			});

			await logAudit({
				tenantId, userId: locals.user!.id,
				action: 'update', entityType: 'transaction',
				entityId: updated._id.toString(),
				newValue: { type, amount, description }
			});

			throw redirect(302, '/app/transactions');
		} catch (err: any) {
			return fail(500, { error: err.message || 'Error al actualizar la transaccion' });
		}
	}
};
