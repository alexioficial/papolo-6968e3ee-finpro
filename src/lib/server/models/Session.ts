import mongoose, { Schema, type Document } from 'mongoose';

export interface ISession extends Document {
	_id: string;
	userId: mongoose.Types.ObjectId;
	expiresAt: Date;
}

const sessionSchema = new Schema<ISession>({
	_id: { type: String, required: true },
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
});

export const Session = mongoose.model<ISession>('Session', sessionSchema);
