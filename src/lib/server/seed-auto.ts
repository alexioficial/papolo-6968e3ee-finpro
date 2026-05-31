import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Auto-seed: runs once on first deploy to populate demo data.
 * If demo tenant exists but has no users, it resets and recreates everything.
 */
export async function autoSeed(): Promise<boolean> {
	try {
		// Wait for mongoose to be connected
		if (mongoose.connection.readyState !== 1) {
			console.log('[seed] Waiting for MongoDB connection...');
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => reject(new Error('Timeout waiting for DB connection')), 10000);
				const check = () => {
					if (mongoose.connection.readyState === 1) {
						clearTimeout(timeout);
						resolve();
					} else if (mongoose.connection.readyState === 2) {
						setTimeout(check, 100);
					} else {
						clearTimeout(timeout);
						reject(new Error('DB connection failed'));
					}
				};
				check();
			});
		}

		const db = mongoose.connection.db;
		if (!db) {
			console.error('[seed] No DB instance available');
			return false;
		}

		const existingTenant = await db.collection('tenants').findOne({ slug: 'demo' });

		// If tenant exists, check if it has complete data
		if (existingTenant) {
			const userCount = await db.collection('users').countDocuments({ tenantId: existingTenant._id });
			if (userCount > 0) {
				console.log('[seed] Demo data already complete, skipping');
				return false;
			}
			// Partial data found - reset everything for this tenant
			console.log('[seed] Partial demo data found, resetting...');
			await db.collection('tenants').deleteOne({ _id: existingTenant._id });
			await db.collection('users').deleteMany({ tenantId: existingTenant._id });
			await db.collection('categories').deleteMany({ tenantId: existingTenant._id });
			await db.collection('accounts').deleteMany({ tenantId: existingTenant._id });
			await db.collection('transactions').deleteMany({ tenantId: existingTenant._id });
		}

		console.log('[seed] Creating demo data...');

		// Create Tenant
		const tenantResult = await db.collection('tenants').insertOne({
			name: 'Mi Empresa S.A.S',
			slug: 'demo',
			plan: 'pro',
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});
		const tenantId = tenantResult.insertedId;

		// Create Admin User
		const passwordHash = await bcrypt.hash('admin123', 12);
		const adminResult = await db.collection('users').insertOne({
			tenantId,
			email: 'admin@empresa.com',
			name: 'Admin Principal',
			role: 'admin',
			passwordHash,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});
		const adminId = adminResult.insertedId;

		// Create Contador User
		const contadorHash = await bcrypt.hash('contador123', 12);
		await db.collection('users').insertOne({
			tenantId,
			email: 'contador@empresa.com',
			name: 'Carlos Contador',
			role: 'contador',
			passwordHash: contadorHash,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		// Create Viewer User
		const viewerHash = await bcrypt.hash('viewer123', 12);
		await db.collection('users').insertOne({
			tenantId,
			email: 'viewer@empresa.com',
			name: 'Victor Viewer',
			role: 'viewer',
			passwordHash: viewerHash,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		// Create Categories
		const incomeCats = [
			{ name: 'Ventas', color: '#22c55e' },
			{ name: 'Servicios Profesionales', color: '#3b82f6' },
			{ name: 'Inversiones', color: '#8b5cf6' }
		];
		const expenseCats = [
			{ name: 'Alquiler', color: '#ef4444' },
			{ name: 'Servicios (Luz, Agua, Internet)', color: '#f59e0b' },
			{ name: 'Salarios', color: '#ec4899' },
			{ name: 'Marketing', color: '#14b8a6' },
			{ name: 'Insumos', color: '#f97316' }
		];

		const catDocs: any[] = [];
		for (const cat of incomeCats) {
			const r = await db.collection('categories').insertOne({
				tenantId, name: cat.name, type: 'income',
				parentCategory: null, color: cat.color, isActive: true,
				createdAt: new Date(), updatedAt: new Date()
			});
			catDocs.push({ ...cat, _id: r.insertedId, type: 'income' });
		}
		for (const cat of expenseCats) {
			const r = await db.collection('categories').insertOne({
				tenantId, name: cat.name, type: 'expense',
				parentCategory: null, color: cat.color, isActive: true,
				createdAt: new Date(), updatedAt: new Date()
			});
			catDocs.push({ ...cat, _id: r.insertedId, type: 'expense' });
		}
		console.log(`[seed] Created ${catDocs.length} categories`);

		function getCatId(name: string) {
			return catDocs.find((c: any) => c.name === name)!._id;
		}

		// Accounts
		const acc1 = await db.collection('accounts').insertOne({
			tenantId, name: 'Banco Principal', type: 'bank', balance: 1500000, currency: 'ARS',
			isActive: true, createdAt: new Date(), updatedAt: new Date()
		});
		const acc2 = await db.collection('accounts').insertOne({
			tenantId, name: 'Caja Chica', type: 'cash', balance: 50000, currency: 'ARS',
			isActive: true, createdAt: new Date(), updatedAt: new Date()
		});
		const acc3 = await db.collection('accounts').insertOne({
			tenantId, name: 'Tarjeta Corporativa', type: 'credit_card', balance: -150000, currency: 'ARS',
			isActive: true, createdAt: new Date(), updatedAt: new Date()
		});
		console.log('[seed] Created 3 accounts');

		// Transactions
		const now = new Date();
		const txDocs = [
			{ accountId: acc1.insertedId, categoryId: getCatId('Ventas'), type: 'income', amount: 450000, description: 'Venta de productos - Cliente Corp A', date: new Date(now.getFullYear(), now.getMonth(), 15), reference: 'FACT-001' },
			{ accountId: acc1.insertedId, categoryId: getCatId('Servicios Profesionales'), type: 'income', amount: 280000, description: 'Consultoria mensual - Cliente B', date: new Date(now.getFullYear(), now.getMonth(), 10), reference: 'FACT-002' },
			{ accountId: acc1.insertedId, categoryId: getCatId('Salarios'), type: 'expense', amount: 320000, description: 'Nomina mensual empleados', date: new Date(now.getFullYear(), now.getMonth(), 5), reference: 'REC-001' },
			{ accountId: acc2.insertedId, categoryId: getCatId('Insumos'), type: 'expense', amount: 85000, description: 'Compra de insumos de oficina', date: new Date(now.getFullYear(), now.getMonth(), 8), reference: 'FACT-003' },
			{ accountId: acc3.insertedId, categoryId: getCatId('Marketing'), type: 'expense', amount: 120000, description: 'Campana publicitaria redes sociales', date: new Date(now.getFullYear(), now.getMonth(), 12), reference: 'FACT-004' },
			{ accountId: acc1.insertedId, categoryId: getCatId('Alquiler'), type: 'expense', amount: 200000, description: 'Alquiler oficina mensual', date: new Date(now.getFullYear(), now.getMonth(), 1), reference: 'REC-002' },
			{ accountId: acc1.insertedId, categoryId: getCatId('Servicios (Luz, Agua, Internet)'), type: 'expense', amount: 45000, description: 'Servicios publicos del mes', date: new Date(now.getFullYear(), now.getMonth(), 3), reference: 'FACT-005' },
			{ accountId: acc2.insertedId, categoryId: getCatId('Ventas'), type: 'income', amount: 35000, description: 'Venta menor - Cliente mostrador', date: new Date(now.getFullYear(), now.getMonth(), 18), reference: 'TICKET-001' }
		].map(t => ({
			tenantId,
			accountId: t.accountId,
			categoryId: t.categoryId,
			type: t.type,
			amount: t.amount,
			currency: 'ARS',
			description: t.description,
			date: t.date,
			isScheduled: false,
			isReconciled: true,
			reference: t.reference,
			createdBy: adminId,
			createdAt: new Date(),
			updatedAt: new Date()
		}));

		await db.collection('transactions').insertMany(txDocs);
		console.log(`[seed] Created ${txDocs.length} transactions`);

		console.log('[seed] Auto-seed completed successfully!');
		console.log('[seed]   Admin:   admin@empresa.com / admin123');
		console.log('[seed]   Contador: contador@empresa.com / contador123');
		console.log('[seed]   Viewer:  viewer@empresa.com / viewer123');
		return true;
	} catch (err) {
		console.error('[seed] Auto-seed failed:', err);
		return false;
	}
}
