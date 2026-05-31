import { connectDB, isDBConnected } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		await connectDB();
		const dbState = isDBConnected();

		let tenantCount = 0;
		let userCount = 0;

		if (dbState) {
			const mongoose = await import('mongoose');
			const db = mongoose.default.connection.db;
			if (db) {
				tenantCount = await db.collection('tenants').countDocuments();
				userCount = await db.collection('users').countDocuments();
			}
		}

		return json({
			status: 'ok',
			dbConnected: dbState,
			tenants: tenantCount,
			users: userCount,
			mongooseVersion: (await import('mongoose')).default.version
		});
	} catch (err: any) {
		return json({
			status: 'error',
			message: err.message,
			stack: err.stack?.split('\n').slice(0, 5).join('\n')
		}, { status: 500 });
	}
};
