import { fail, redirect } from '@sveltejs/kit';
import { User } from '$lib/server/models/User';
import { requireRole } from '$lib/server/authorize';
import { hashPassword } from '$lib/server/auth';
import { logAudit } from '$lib/server/services/audit.service';
import { serialize } from '$lib/server/serialize';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireRole(['admin'], locals.user?.role);
	const tenantId = locals.user!.tenantId;
	const users = await User.find({ tenantId }).select('-passwordHash').sort({ role: 1, name: 1 }).lean();
	return serialize({ users });
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		requireRole(['admin'], locals.user?.role);
		const tenantId = locals.user!.tenantId;
		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const email = (formData.get('email') as string)?.trim().toLowerCase();
		const password = formData.get('password') as string;
		const role = formData.get('role') as string;
		if (!name || !email || !password || !role) return fail(400, { error: 'Todos los campos son requeridos' });
		if (password.length < 6) return fail(400, { error: 'La contrasena debe tener al menos 6 caracteres' });
		const existing = await User.findOne({ tenantId, email });
		if (existing) return fail(409, { error: 'Ya existe un usuario con ese email' });
		const passwordHash = await hashPassword(password);
		await User.create({ tenantId, name, email, passwordHash, role });
		await logAudit({ tenantId, userId: locals.user!.id, action: 'create_user', entityType: 'user', entityId: email, newValue: { name, email, role } });
	},
	deactivate: async ({ request, locals }) => {
		requireRole(['admin'], locals.user?.role);
		const tenantId = locals.user!.tenantId;
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const user = await User.findOne({ _id: userId, tenantId });
		if (!user) return fail(404, { error: 'Usuario no encontrado' });
		if (user._id.toString() === locals.user!.id) return fail(400, { error: 'No puedes desactivarte a ti mismo' });
		user.isActive = !user.isActive;
		await user.save();
	}
};
