import mongoose, { Schema, type Document } from 'mongoose';

export type CategoryType = 'income' | 'expense';

export interface ICategory extends Document {
	tenantId: mongoose.Types.ObjectId;
	name: string;
	type: CategoryType;
	parentCategory: mongoose.Types.ObjectId | null;
	color: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
	{
		tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
		name: { type: String, required: true, trim: true },
		type: { type: String, enum: ['income', 'expense'], required: true },
		parentCategory: {
			type: Schema.Types.ObjectId,
			ref: 'Category',
			default: null
		},
		color: { type: String, default: '#3b82f6', trim: true },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

categorySchema.index({ tenantId: 1, name: 1, type: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
