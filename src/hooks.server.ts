import { connectDB, isDBConnected } from '$lib/server/db';
import { validateSession } from '$lib/server/auth';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	try { await connectDB(); } catch (err) { console.error('DB connect error:', err); }

	if (isDBConnected()) {
		try {
			const sessionData = await validateSession(event.cookies);
			if (sessionData) {
				event.locals.user = {
					id: String(sessionData.user._id),
					tenantId: String(sessionData.user.tenantId._id || sessionData.user.tenantId),
					email: sessionData.user.email,
					name: sessionData.user.name,
					role: sessionData.user.role
				};
				event.locals.tenant = {
					id: String(sessionData.tenant._id),
					name: sessionData.tenant.name,
					slug: sessionData.tenant.slug,
					plan: sessionData.tenant.plan
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

	return resolve(event);
};

export const handleError: HandleServerError = async ({ error, event }) => {
	console.error('Error:', error instanceof Error ? error.message : error, 'URL:', event.url.pathname);
	// Pass through the original message if available
	const message = error instanceof Error ? error.message : 'Error interno del servidor';
	return { message, code: 'ERROR' };
};
