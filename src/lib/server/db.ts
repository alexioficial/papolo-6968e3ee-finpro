import mongoose from 'mongoose';
import { dev } from '$app/environment';

let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose | null> {
	if (cachedConnection) return cachedConnection;

	const MONGODB_URI = process.env.MONGODB_URI;
	if (!MONGODB_URI) {
		console.warn('MONGODB_URI not set — DB features will be unavailable');
		return null;
	}

	if (!connectionPromise) {
		connectionPromise = mongoose
			.connect(MONGODB_URI, {
				maxPoolSize: 10,
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000
			})
			.then((conn) => {
				cachedConnection = conn;
				if (dev) console.log('MongoDB connected');
				return conn;
			})
			.catch((err) => {
				console.error('MongoDB connection error:', err);
				connectionPromise = null;
				return null;
			});
	}

	return connectionPromise;
}

export function isDBConnected(): boolean {
	return cachedConnection !== null && mongoose.connection.readyState === 1;
}
