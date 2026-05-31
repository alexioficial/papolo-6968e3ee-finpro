import { AuditLog } from '../models/AuditLog';
import type mongoose from 'mongoose';

interface AuditInput {
	tenantId: mongoose.Types.ObjectId | string;
	userId: mongoose.Types.ObjectId | string;
	action: string;
	entityType: string;
	entityId: string;
	oldValue?: Record<string, unknown> | null;
	newValue?: Record<string, unknown> | null;
	ip?: string;
}

export async function logAudit(input: AuditInput): Promise<void> {
	try {
		await AuditLog.create({
			tenantId: input.tenantId,
			userId: input.userId,
			action: input.action,
			entityType: input.entityType,
			entityId: input.entityId,
			oldValue: input.oldValue ?? null,
			newValue: input.newValue ?? null,
			ip: input.ip ?? '',
			timestamp: new Date()
		});
	} catch (err) {
		// Don't let audit logging failures break the main flow
		console.error('Audit log error:', err);
	}
}
