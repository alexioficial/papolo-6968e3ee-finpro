/// <reference types="@sveltejs/kit" />

declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				tenantId: string;
				email: string;
				name: string;
				role: 'admin' | 'contador' | 'viewer';
			} | null;
			tenant: {
				id: string;
				name: string;
				slug: string;
				plan: string;
			} | null;
		}
	}

	// eslint-disable-next-line no-var
	var _mongooseConnection:
		| {
				conn: typeof import('mongoose') | null;
				promise: Promise<typeof import('mongoose')> | null;
		  }
		| undefined;
}

export {};
