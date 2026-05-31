import { fail, redirect } from '@sveltejs/kit';
import { User } from '$lib/server/models/User';
import { verifyPassword, createSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/app');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = (formData.get('email') as string)?.trim().toLowerCase();
		const password = formData.get('password') as string;

		if (!email) {
			return fail(400, { error: 'El email es requerido', email: '' });
		}
		if (!password) {
			return fail(400, { error: 'La contraseña es requerida', email });
		}

		const user = await User.findOne({ email, isActive: true }).populate('tenantId');
		if (!user) {
			return fail(401, { error: 'Credenciales invalidas', email });
		}

		const valid = await verifyPassword(password, user.passwordHash);
		if (!valid) {
			return fail(401, { error: 'Credenciales invalidas', email });
		}

		await createSession(user._id.toString(), cookies);
		throw redirect(302, '/app');
	}
};
