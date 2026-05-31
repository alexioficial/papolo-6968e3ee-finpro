import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Auto-seed: runs on first request to populate demo data.
 * Checks for completeness — if tenant + users exist but missing accounts, fills the gap.
 */
export async function autoSeed(): Promise<boolean> {
	try {
		if (mongoose.connection.readyState !== 1) {
			console.log('[seed] Waiting for MongoDB connection...');
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => reject(new Error('Timeout waiting for DB connection')), 10000);
				const check = () => {
					if (mongoose.connection.readyState === 1) { clearTimeout(timeout); resolve(); }
					else if (mongoose.connection.readyState === 2) { setTimeout(check, 100); }
					else { clearTimeout(timeout); reject(new Error('DB connection failed')); }
				};
				check();
			});
		}

		const db = mongoose.connection.db;
		if (!db) { console.error('[seed] No DB instance'); return false; }

		// Check if we need to seed
		const existingTenant = await db.collection('tenants').findOne({ slug: 'demo' });

		if (existingTenant) {
			// Check completeness
			const userCount = await db.collection('users').countDocuments({ tenantId: existingTenant._id });
			const accountCount = await db.collection('accounts').countDocuments({ tenantId: existingTenant._id });

			if (userCount > 0 && accountCount > 0) {
				console.log('[seed] Demo data already complete, skipping');
				return false;
			}

			// Partial — fill missing data
			console.log('[seed] Partial data found, filling gaps...');

			if (accountCount === 0) {
				await fillAccountsAndTransactions(db, existingTenant._id);
			}

			console.log('[seed] Gap-fill completed');
			return true;
		}

		// No tenant at all — full seed
		console.log('[seed] No demo data — running full seed...');
		await fullSeed(db);
		return true;
	} catch (err) {
		console.error('[seed] Auto-seed failed:', err);
		return false;
	}
}

async function fullSeed(db: any) {
	const tenantResult = await db.collection('tenants').insertOne({
		name: 'Mi Empresa S.A.S', slug: 'demo', plan: 'pro', isActive: true,
		createdAt: new Date(), updatedAt: new Date()
	});
	const tenantId = tenantResult.insertedId;

	const passwordHash = await bcrypt.hash('admin123', 12);
	const adminResult = await db.collection('users').insertOne({
		tenantId, email: 'admin@empresa.com', name: 'Admin Principal', role: 'admin',
		passwordHash, isActive: true, createdAt: new Date(), updatedAt: new Date()
	});
	const adminId = adminResult.insertedId;

	const contadorHash = await bcrypt.hash('contador123', 12);
	await db.collection('users').insertOne({
		tenantId, email: 'contador@empresa.com', name: 'Carlos Contador', role: 'contador',
		passwordHash: contadorHash, isActive: true, createdAt: new Date(), updatedAt: new Date()
	});

	const viewerHash = await bcrypt.hash('viewer123', 12);
	await db.collection('users').insertOne({
		tenantId, email: 'viewer@empresa.com', name: 'Victor Viewer', role: 'viewer',
		passwordHash: viewerHash, isActive: true, createdAt: new Date(), updatedAt: new Date()
	});

	await createCategories(db, tenantId);

	// Get admin user for createdBy
	const admin = await db.collection('users').findOne({ tenantId, role: 'admin' });
	await createAccountsAndTransactions(db, tenantId, admin!._id);

	console.log('[seed] Full seed complete');
	console.log('[seed]   Admin: admin@empresa.com / admin123');
}

async function createCategories(db: any, tenantId: any) {
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

	for (const cat of incomeCats) {
		await db.collection('categories').insertOne({
			tenantId, name: cat.name, type: 'income', parentCategory: null,
			color: cat.color, isActive: true, createdAt: new Date(), updatedAt: new Date()
		});
	}
	for (const cat of expenseCats) {
		await db.collection('categories').insertOne({
			tenantId, name: cat.name, type: 'expense', parentCategory: null,
			color: cat.color, isActive: true, createdAt: new Date(), updatedAt: new Date()
		});
	}
	console.log('[seed] Created 8 categories');
}

async function getCatIdByName(db: any, tenantId: any, name: string) {
	const cat = await db.collection('categories').findOne({ tenantId, name });
	return cat!._id;
}

async function createAccountsAndTransactions(db: any, tenantId: any, adminId: any) {
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

	const ventasId = await getCatIdByName(db, tenantId, 'Ventas');
	const serviciosId = await getCatIdByName(db, tenantId, 'Servicios Profesionales');
	const salariosId = await getCatIdByName(db, tenantId, 'Salarios');
	const insumosId = await getCatIdByName(db, tenantId, 'Insumos');
	const marketingId = await getCatIdByName(db, tenantId, 'Marketing');
	const alquilerId = await getCatIdByName(db, tenantId, 'Alquiler');
	const serviciosPubId = await getCatIdByName(db, tenantId, 'Servicios (Luz, Agua, Internet)');

	const now = new Date();
	const txDocs = [
		{ accountId: acc1.insertedId, categoryId: ventasId, type: 'income', amount: 450000, description: 'Venta de productos - Cliente Corp A', date: new Date(now.getFullYear(), now.getMonth(), 15), reference: 'FACT-001' },
		{ accountId: acc1.insertedId, categoryId: serviciosId, type: 'income', amount: 280000, description: 'Consultoria mensual - Cliente B', date: new Date(now.getFullYear(), now.getMonth(), 10), reference: 'FACT-002' },
		{ accountId: acc1.insertedId, categoryId: salariosId, type: 'expense', amount: 320000, description: 'Nomina mensual empleados', date: new Date(now.getFullYear(), now.getMonth(), 5), reference: 'REC-001' },
		{ accountId: acc2.insertedId, categoryId: insumosId, type: 'expense', amount: 85000, description: 'Compra de insumos de oficina', date: new Date(now.getFullYear(), now.getMonth(), 8), reference: 'FACT-003' },
		{ accountId: acc3.insertedId, categoryId: marketingId, type: 'expense', amount: 120000, description: 'Campana publicitaria redes sociales', date: new Date(now.getFullYear(), now.getMonth(), 12), reference: 'FACT-004' },
		{ accountId: acc1.insertedId, categoryId: alquilerId, type: 'expense', amount: 200000, description: 'Alquiler oficina mensual', date: new Date(now.getFullYear(), now.getMonth(), 1), reference: 'REC-002' },
		{ accountId: acc1.insertedId, categoryId: serviciosPubId, type: 'expense', amount: 45000, description: 'Servicios publicos del mes', date: new Date(now.getFullYear(), now.getMonth(), 3), reference: 'FACT-005' },
		{ accountId: acc2.insertedId, categoryId: ventasId, type: 'income', amount: 35000, description: 'Venta menor - Cliente mostrador', date: new Date(now.getFullYear(), now.getMonth(), 18), reference: 'TICKET-001' }
	].map(t => ({
		tenantId, accountId: t.accountId, categoryId: t.categoryId,
		type: t.type, amount: t.amount, currency: 'ARS',
		description: t.description, date: t.date,
		isScheduled: false, isReconciled: true, reference: t.reference,
		createdBy: adminId, createdAt: new Date(), updatedAt: new Date()
	}));

	await db.collection('transactions').insertMany(txDocs);
	console.log(`[seed] Created ${txDocs.length} transactions`);
}

async function fillAccountsAndTransactions(db: any, tenantId: any) {
	// Check if categories exist, if not create them
	const catCount = await db.collection('categories').countDocuments({ tenantId });
	if (catCount === 0) {
		await createCategories(db, tenantId);
	}

	const admin = await db.collection('users').findOne({ tenantId, role: 'admin' });
	if (!admin) {
		console.log('[seed] No admin user found, skipping account fill');
		return;
	}

	await createAccountsAndTransactions(db, tenantId, admin._id);
}
