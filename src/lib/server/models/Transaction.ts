import mongoose, { Schema, type Document } from 'mongoose';

export type TransactionType = 'income' | 'expense';

export interface ITransaction extends Document {
	tenantId: mongoose.Types.ObjectId;
	accountId: mongoose.Types.ObjectId;
	categoryId: mongoose.Types.ObjectId;
	type: TransactionType;
	amount: number;
	currency: string;
	description: string;
	date: Date;
	isScheduled: boolean;
	isReconciled: boolean;
	reference: string | null;
	createdBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
	{
		tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
		accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
		categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
		type: { type: String, enum: ['income', 'expense'], required: true },
		amount: { type: Number, required: true, min: 0.01 },
		currency: { type: String, default: 'ARS', trim: true },
		description: { type: String, required: true, trim: true, maxlength: 500 },
		date: { type: Date, required: true },
		isScheduled: { type: Boolean, default: false },
		isReconciled: { type: Boolean, default: false },
		reference: { type: String, default: null, trim: true },
		createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
	},
	{ timestamps: true }
);

transactionSchema.index({ tenantId: 1, date: -1 });
transactionSchema.index({ tenantId: 1, accountId: 1 });
transactionSchema.index({ tenantId: 1, categoryId: 1 });
transactionSchema.index({ tenantId: 1, type: 1, date: -1 });
transactionSchema.index({ tenantId: 1, description: 'text' });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
