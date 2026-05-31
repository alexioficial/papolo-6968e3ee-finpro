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
			const session = await validateSession(event.cookies);
			if (session) {
				event.locals.user = {
					id: session.user._id.toString(),
					tenantId: session.user.tenantId._id?.toString() || session.user.tenantId.toString(),
					email: session.user.email,
					name: session.user.name,
					role: session.user.role
				};
				event.locals.tenant = {
					id: session.tenant._id.toString(),
					name: session.tenant.name,
					slug: session.tenant.slug,
					plan: session.tenant.plan
				};
			}
		} catch (err) {
			console.error('Session validation error:', err);
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

	// Log more details if available
	if (error instanceof Error) {
		console.error('  message:', error.message);
		console.error('  stack:', error.stack?.split('\n').slice(0, 4).join('\n'));
	}

	return {
		message: 'Error interno del servidor',
		code: 'INTERNAL_ERROR'
	};
};
