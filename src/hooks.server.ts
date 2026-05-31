import { connectDB, isDBConnected } from '$lib/server/db';
import { validateSession } from '$lib/server/auth';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Connect to DB lazily
	try {
		await connectDB();
	} catch (err) {
		console.error('Failed to connect to MongoDB:', err);
	}

	// Validate session
	if (isDBConnected()) {
		try {
			const sessionData = await validateSession(event.cookies);
			if (sessionData) {
				const userObj = sessionData.user;
				const tenantObj = sessionData.tenant;

				event.locals.user = {
					id: String(userObj._id),
					tenantId: String(userObj.tenantId._id || userObj.tenantId),
					email: userObj.email,
					name: userObj.name,
					role: userObj.role
				};
				event.locals.tenant = {
					id: String(tenantObj._id),
					name: tenantObj.name,
					slug: tenantObj.slug,
					plan: tenantObj.plan
				};
			} else {
				event.locals.user = null;
				event.locals.tenant = null;
			}
		} catch (err) {
			console.error('Session error:', err);
			event.locals.user = null;
			event.locals.tenant = null;
		}
	} else {
		event.locals.user = null;
		event.locals.tenant = null;
	}

	const response = await resolve(event);
	return response;
};

export const handleError: HandleServerError = async ({ error, event }) => {
	console.error('Error:', error instanceof Error ? error.message : error, 'URL:', event.url.pathname);
	return {
		message: 'Error interno del servidor',
		code: 'INTERNAL_ERROR'
	};
};
