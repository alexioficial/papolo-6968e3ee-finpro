import { getDetailedReport } from '$lib/server/services/report.service';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	const tenantId = locals.user!.tenantId;

	const type = url.searchParams.get('type') || undefined;
	const accountId = url.searchParams.get('account') || undefined;
	const categoryId = url.searchParams.get('category') || undefined;
	const startDate = url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined;
	const endDate = url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined;

	const result = await getDetailedReport(tenantId, {
		startDate,
		endDate,
		accountId,
		categoryId,
		type: type as any,
		page: 1,
		limit: 10000
	});

	const headers = ['Fecha', 'Tipo', 'Descripcion', 'Categoria', 'Cuenta', 'Monto', 'Referencia'];
	const rows = result.data.map((r: any) => [
		new Date(r.date).toISOString().split('T')[0],
		r.type === 'income' ? 'Ingreso' : 'Gasto',
		`"${(r.description || '').replace(/"/g, '""')}"`,
		`"${r.category?.name || ''}"`,
		`"${r.account?.name || ''}"`,
		r.amount.toFixed(2),
		`"${r.reference || ''}"`
	].join(','));

	const csv = [headers.join(','), ...rows].join('\n');

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="reporte-${new Date().toISOString().split('T')[0]}.csv"`
		}
	});
};
