/**
 * Deep-converts Mongoose/Bson data to plain serializable JSON.
 * Use this in every load function that returns Mongoose data.
 */
export function serialize<T>(data: T): T {
	return JSON.parse(JSON.stringify(data));
}
