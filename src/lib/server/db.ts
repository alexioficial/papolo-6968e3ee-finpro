import mongoose from 'mongoose';
import { dev } from '$app/environment';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error('MONGODB_URI environment variable is required');
}

let cached = global._mongooseConnection;

if (!cached) {
	cached = global._mongooseConnection = { conn: null, promise: null };
}

export async function connectDB() {
	if (cached.conn) return cached.conn;

	if (!cached.promise) {
		cached.promise = mongoose.connect(MONGODB_URI, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000
		});
	}

	try {
		cached.conn = await cached.promise;
		if (dev) console.log('MongoDB connected');
		return cached.conn;
	} catch (error) {
		cached.promise = null;
		console.error('MongoDB connection error:', error);
		throw error;
	}
}
