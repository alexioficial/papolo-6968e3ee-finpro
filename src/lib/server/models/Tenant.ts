import mongoose, { Schema, type Document } from 'mongoose';

export interface ITenant extends Document {
	name: string;
	slug: string;
	plan: 'free' | 'pro' | 'enterprise';
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
	{
		name: { type: String, required: true, trim: true },
		slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
		plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
