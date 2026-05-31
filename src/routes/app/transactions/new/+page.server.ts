import { fail, redirect } from '@sveltejs/kit';
import { Account } from '$lib/server/models/Account';
import { Category } from '$lib/server/models/Category';
import { requireRole } from '$lib/server/authorize';
import { createTransaction } from '$lib/server/services/transaction.service';
import { logAudit } from '$lib/server/services/audit.service';
import { serialize } from '$lib/server/serialize';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireRole(['admin', 'contador'], locals.user?.role);
	const tenantId = locals.user!.tenantId;

	const [accounts, categories] = await Promise.all([
		Account.find({ tenantId, isActive: true }).select('name type balance').lean(),
		Category.find({ tenantId, isActive: true }).select('name type color').lean()
	]);

	return serialize({ accounts, categories });
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
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
		const isScheduled = formData.get('isScheduled') === 'on';

		const errors: Record<string, string> = {};
		if (!type || !['income', 'expense'].includes(type)) errors.type = 'Selecciona un tipo';
		if (!accountId) errors.accountId = 'Selecciona una cuenta';
		if (!categoryId) errors.categoryId = 'Selecciona una categoria';
		if (!amount || amount <= 0) errors.amount = 'El monto debe ser mayor a 0';
		if (!description || description.length < 3) errors.description = 'Ingresa una descripcion (min 3 caracteres)';
		if (!dateStr) errors.date = 'Selecciona una fecha';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: { type, accountId, categoryId, amount, description, dateStr, reference, isScheduled } });
		}

		const date = new Date(dateStr);

		const category = await Category.findOne({ _id: categoryId, tenantId });
		if (!category || category.type !== type) {
			return fail(400, {
				errors: { categoryId: 'La categoria no coincide con el tipo de transaccion' },
				values: { type, accountId, categoryId, amount, description, dateStr, reference, isScheduled }
			});
		}

		try {
			const transaction = await createTransaction({
				tenantId, accountId, categoryId,
				type: type as 'income' | 'expense',
				amount, description, date,
				isScheduled, reference: reference || undefined,
				createdBy: locals.user!.id
			});

			await logAudit({
				tenantId, userId: locals.user!.id,
				action: 'create', entityType: 'transaction',
				entityId: transaction._id.toString(),
				newValue: { type, amount, description, accountId, categoryId }
			});

			throw redirect(302, '/app/transactions');
		} catch (err: any) {
			return fail(500, {
				errors: { _form: err.message || 'Error al crear la transaccion' },
				values: { type, accountId, categoryId, amount, description, dateStr, reference, isScheduled }
			});
		}
	}
};
