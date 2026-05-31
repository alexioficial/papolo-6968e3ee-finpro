import mongoose, { Schema, type Document } from 'mongoose';

export type UserRole = 'admin' | 'contador' | 'viewer';

export interface IUser extends Document {
	tenantId: mongoose.Types.ObjectId;
	email: string;
	name: string;
	role: UserRole;
	passwordHash: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
		email: { type: String, required: true, trim: true, lowercase: true },
		name: { type: String, required: true, trim: true },
		role: { type: String, enum: ['admin', 'contador', 'viewer'], required: true },
		passwordHash: { type: String, required: true },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
