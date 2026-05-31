import type { UserRole } from './models/User';
import { error } from '@sveltejs/kit';

export function requireRole(
	allowedRoles: UserRole[],
	userRole: UserRole | undefined,
	message = 'No tienes permisos para realizar esta accion'
): void {
	if (!userRole || !allowedRoles.includes(userRole)) {
		throw error(403, message);
	}
}

export function isAdmin(role: UserRole | undefined): boolean {
	return role === 'admin';
}

export function isContador(role: UserRole | undefined): boolean {
	return role === 'admin' || role === 'contador';
}

export function canWrite(role: UserRole | undefined): boolean {
	return role === 'admin' || role === 'contador';
}

export function canManageUsers(role: UserRole | undefined): boolean {
	return role === 'admin';
}
