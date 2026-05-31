import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
	console.error('MONGODB_URI environment variable is required');
	process.exit(1);
}

async function seed() {
	await mongoose.connect(MONGODB_URI);
	console.log('Connected to MongoDB');

	const db = mongoose.connection.db!;

	// Check if seed already exists
	const existingTenant = await db.collection('tenants').findOne({ slug: 'demo' });
	if (existingTenant) {
		console.log('Seed data already exists, skipping...');
		await mongoose.disconnect();
		return;
	}

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
	console.log('Tenant created:', 'Mi Empresa S.A.S');

	// Create Admin User (password: admin123)
	const bcrypt = await import('bcryptjs');
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
	console.log('Admin user created: admin@empresa.com / admin123');

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
	console.log('Contador user created: contador@empresa.com / contador123');

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
	console.log('Viewer user created: viewer@empresa.com / viewer123');

	// Create Categories
	const incomeCategories = [
		{ name: 'Ventas', color: '#22c55e' },
		{ name: 'Servicios Profesionales', color: '#3b82f6' },
		{ name: 'Inversiones', color: '#8b5cf6' }
	];

	const expenseCategories = [
		{ name: 'Alquiler', color: '#ef4444' },
		{ name: 'Servicios (Luz, Agua, Internet)', color: '#f59e0b' },
		{ name: 'Salarios', color: '#ec4899' },
		{ name: 'Marketing', color: '#14b8a6' },
		{ name: 'Insumos', color: '#f97316' }
	];

	const categoryDocs = [];
	for (const cat of incomeCategories) {
		const result = await db.collection('categories').insertOne({
			tenantId,
			name: cat.name,
			type: 'income',
			parentCategory: null,
			color: cat.color,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});
		categoryDocs.push({ ...cat, _id: result.insertedId, type: 'income' });
	}

	for (const cat of expenseCategories) {
		const result = await db.collection('categories').insertOne({
			tenantId,
			name: cat.name,
			type: 'expense',
			parentCategory: null,
			color: cat.color,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		});
		categoryDocs.push({ ...cat, _id: result.insertedId, type: 'expense' });
	}
	console.log('Categories created:', categoryDocs.length);

	// Create Accounts
	const accountResult1 = await db.collection('accounts').insertOne({
		tenantId,
		name: 'Banco Principal',
		type: 'bank',
		balance: 1500000,
		currency: 'ARS',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	});
	const account1Id = accountResult1.insertedId;

	const accountResult2 = await db.collection('accounts').insertOne({
		tenantId,
		name: 'Caja Chica',
		type: 'cash',
		balance: 50000,
		currency: 'ARS',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	});
	const account2Id = accountResult2.insertedId;

	const accountResult3 = await db.collection('accounts').insertOne({
		tenantId,
		name: 'Tarjeta Corporativa',
		type: 'credit_card',
		balance: -150000,
		currency: 'ARS',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	});
	console.log('Accounts created: 3');

	// Helper to get category ID by name
	function getCatId(name: string) {
		return categoryDocs.find(c => c.name === name)!._id;
	}

	// Create sample transactions
	const now = new Date();
	const transactions = [
		{
			tenantId,
			accountId: account1Id,
			categoryId: getCatId('Ventas'),
			type: 'income',
			amount: 450000,
			description: 'Venta de productos - Cliente Corp A',
			date: new Date(now.getFullYear(), now.getMonth(), 15),
			isScheduled: false,
			isReconciled: true,
			reference: 'FACT-001',
			createdBy: adminId,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			tenantId,
			accountId: account1Id,
			categoryId: getCatId('Servicios Profesionales'),
			type: 'income',
			amount: 280000,
			description: 'Consultoria mensual - Cliente B',
			date: new Date(now.getFullYear(), now.getMonth(), 10),
			isScheduled: false,
			isReconciled: true,
			reference: 'FACT-002',
			createdBy: adminId,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			tenantId,
			accountId: account1Id,
			categoryId: getCatId('Salarios'),
			type: 'expense',
			amount: 320000,
			description: 'Nomina mensual empleados',
			date: new Date(now.getFullYear(), now.getMonth(), 5),
			isScheduled: false,
			isReconciled: true,
			reference: 'REC-001',
			createdBy: adminId,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			tenantId,
			accountId: account2Id,
			categoryId: getCatId('Insumos'),
			type: 'expense',
			amount: 85000,
			description: 'Compra de insumos de oficina',
			date: new Date(now.getFullYear(), now.getMonth(), 8),
			isScheduled: false,
			isReconciled: true,
			reference: 'FACT-003',
			createdBy: adminId,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			tenantId,
			accountId: account3Id,
			categoryId: getCatId('Marketing'),
			type: 'expense',
			amount: 120000,
			description: 'Campana publicitaria redes sociales',
			date: new Date(now.getFullYear(), now.getMonth(), 12),
			isScheduled: false,
			isReconciled: false,
			reference: 'FACT-004',
			createdBy: adminId,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			tenantId,
			accountId: account1Id,
			categoryId: getCatId('Alquiler'),
			type: 'expense',
			amount: 200000,
			description: 'Alquiler oficina mensual',
			date: new Date(now.getFullYear(), now.getMonth(), 1),
			isScheduled: true,
			isReconciled: true,
			reference: 'REC-002',
			createdBy: adminId,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			tenantId,
			accountId: account1Id,
			categoryId: getCatId('Servicios (Luz, Agua, Internet)'),
			type: 'expense',
			amount: 45000,
			description: 'Servicios publicos del mes',
			date: new Date(now.getFullYear(), now.getMonth(), 3),
			isScheduled: false,
			isReconciled: true,
			reference: 'FACT-005',
			createdBy: adminId,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			tenantId,
			accountId: account2Id,
			categoryId: getCatId('Ventas'),
			type: 'income',
			amount: 35000,
			description: 'Venta menor - Cliente mostrador',
			date: new Date(now.getFullYear(), now.getMonth(), 18),
			isScheduled: false,
			isReconciled: true,
			reference: 'TICKET-001',
			createdBy: adminId,
			createdAt: new Date(),
			updatedAt: new Date()
		}
	];

	await db.collection('transactions').insertMany(transactions);
	console.log('Transactions created:', transactions.length);

	console.log('\n--- Seed completed successfully ---');
	console.log('Login credentials:');
	console.log('  Admin:   admin@empresa.com / admin123');
	console.log('  Contador: contador@empresa.com / contador123');
	console.log('  Viewer:  viewer@empresa.com / viewer123');

	await mongoose.disconnect();
	process.exit(0);
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
