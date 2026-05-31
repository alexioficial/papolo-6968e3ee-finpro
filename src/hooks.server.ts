import { connectDB, isDBConnected } from '$lib/server/db';
import { validateSession } from '$lib/server/auth';
import { autoSeed } from '$lib/server/seed-auto';
import type { Handle, HandleServerError } from '@sveltejs/kit';

let seedAttempted = false;

export const handle: Handle = async ({ event, resolve }) => {
	// Attempt to connect to DB lazily
	try {
		await connectDB();
	} catch (err) {
		console.error('Failed to connect to MongoDB:', err);
	}

	// Auto-seed synchronously on first request
	if (isDBConnected() && !seedAttempted) {
		seedAttempted = true;
		try {
			const seeded = await autoSeed();
			if (seeded) console.log('[hooks] Auto-seed completed');
		} catch (err) {
			console.error('[hooks] Auto-seed error:', err);
		}
	}

	// Only validate session if DB is connected
	if (isDBConnected()) {
		try {
			const sessionData = await validateSession(event.cookies);
			if (sessionData) {
				const userObj = sessionData.user;
				const tenantObj = sessionData.tenant;

				// Safely extract IDs
				const userId = typeof userObj._id === 'object' ? userObj._id.toString() : String(userObj._id);
				const tenantId = typeof userObj.tenantId === 'object'
					? (userObj.tenantId._id ? userObj.tenantId._id.toString() : String(userObj.tenantId))
					: String(userObj.tenantId);

				event.locals.user = {
					id: userId,
					tenantId: tenantId,
					email: userObj.email,
					name: userObj.name,
					role: userObj.role
				};
				event.locals.tenant = {
					id: typeof tenantObj._id === 'object' ? tenantObj._id.toString() : String(tenantObj._id),
					name: tenantObj.name,
					slug: tenantObj.slug,
					plan: tenantObj.plan
				};
			} else {
				event.locals.user = null;
				event.locals.tenant = null;
			}
		} catch (err) {
			console.error('Session validation error:', err);
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
	console.error('Server error:', error, 'URL:', event.url.pathname);
	if (error instanceof Error) {
		console.error('  message:', error.message);
	}
	return {
		message: 'Error interno del servidor',
		code: 'INTERNAL_ERROR'
	};
};
