import mongoose, { Schema, type Document } from 'mongoose';

export type AccountType = 'bank' | 'cash' | 'credit_card' | 'investment';

export interface IAccount extends Document {
	tenantId: mongoose.Types.ObjectId;
	name: string;
	type: AccountType;
	balance: number;
	currency: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
	{
		tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
		name: { type: String, required: true, trim: true },
		type: {
			type: String,
			enum: ['bank', 'cash', 'credit_card', 'investment'],
			required: true
		},
		balance: { type: Number, required: true, default: 0 },
		currency: { type: String, default: 'ARS', trim: true },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

accountSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const Account = mongoose.model<IAccount>('Account', accountSchema);
