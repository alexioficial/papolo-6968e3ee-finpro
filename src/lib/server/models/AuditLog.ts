import mongoose, { Schema, type Document } from 'mongoose';

export interface IAuditLog extends Document {
	tenantId: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	action: string;
	entityType: string;
	entityId: string;
	oldValue: Record<string, unknown> | null;
	newValue: Record<string, unknown> | null;
	ip: string;
	timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
	tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	action: { type: String, required: true },
	entityType: { type: String, required: true },
	entityId: { type: String, required: true },
	oldValue: { type: Schema.Types.Mixed, default: null },
	newValue: { type: Schema.Types.Mixed, default: null },
	ip: { type: String, default: '' },
	timestamp: { type: Date, default: Date.now, index: -1 }
});

auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
