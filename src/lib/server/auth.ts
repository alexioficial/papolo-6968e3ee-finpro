import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, type IUser } from './models/User';
import { Session } from './models/Session';
import { Tenant } from './models/Tenant';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE = 'session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export async function createSession(
	userId: string,
	cookies: Cookies
): Promise<string> {
	const sessionId = uuidv4();
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

	await Session.create({
		_id: sessionId,
		userId,
		expiresAt
	});

	cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_MAX_AGE
	});

	return sessionId;
}

export async function deleteSession(cookies: Cookies): Promise<void> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		await Session.deleteOne({ _id: sessionId });
	}
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function validateSession(
	cookies: Cookies
): Promise<{ user: IUser; tenant: import('./models/Tenant').ITenant } | null> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (!sessionId) return null;

	const session = await Session.findById(sessionId);
	if (!session) return null;

	if (session.expiresAt < new Date()) {
		await Session.deleteOne({ _id: sessionId });
		return null;
	}

	const user = await User.findById(session.userId).populate('tenantId');
	if (!user || !user.isActive) {
		await Session.deleteOne({ _id: sessionId });
		return null;
	}

	const tenant = await Tenant.findById(user.tenantId);
	if (!tenant || !tenant.isActive) {
		await Session.deleteOne({ _id: sessionId });
		return null;
	}

	// Extend session
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
	await Session.updateOne({ _id: sessionId }, { $set: { expiresAt } });
	cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_MAX_AGE
	});

	return { user, tenant };
}
