<script lang="ts">
	let { data } = $props();
	let { report, accounts, categories, filters } = data;

	let filterType = $state(filters.type || '');
	let filterAccount = $state(filters.accountId || '');
	let filterCategory = $state(filters.categoryId || '');
	let filterFrom = $state(filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : '');
	let filterTo = $state(filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : '');

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
	}

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function exportCSV() {
		const rows = report.data;
		if (!rows.length) return;

		const headers = ['Fecha', 'Tipo', 'Descripcion', 'Categoria', 'Cuenta', 'Monto', 'Referencia'];
		const csvRows = [headers.join(',')];

		for (const r of rows) {
			const row = [
				formatDate(r.date),
				r.type === 'income' ? 'Ingreso' : 'Gasto',
				`"${(r.description || '').replace(/"/g, '""')}"`,
				`"${r.category?.name || ''}"`,
				`"${r.account?.name || ''}"`,
				r.amount.toFixed(2),
				`"${r.reference || ''}"`
			];
			csvRows.push(row.join(','));
		}

		const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `reporte-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="max-w-6xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Reportes</h1>
			<p class="text-slate-500 text-sm mt-1">Analiza tus finanzas con filtros avanzados</p>
		</div>
		<button onclick={exportCSV}
			class="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
			Exportar CSV
		</button>
	</div>

	<!-- Summary -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
		<div class="bg-white rounded-xl border border-slate-200 p-4">
			<p class="text-xs text-green-600 uppercase font-medium">Ingresos</p>
			<p class="text-xl font-bold text-slate-900 mt-1">{formatCurrency(report.summary.totalIncome)}</p>
		</div>
		<div class="bg-white rounded-xl border border-slate-200 p-4">
			<p class="text-xs text-red-600 uppercase font-medium">Gastos</p>
			<p class="text-xl font-bold text-slate-900 mt-1">{formatCurrency(report.summary.totalExpenses)}</p>
		</div>
		<div class="bg-white rounded-xl border border-slate-200 p-4">
			<p class="text-xs text-blue-600 uppercase font-medium">Balance</p>
			<p class="text-xl font-bold {report.summary.balance >= 0 ? 'text-green-700' : 'text-red-700'} mt-1">
				{formatCurrency(report.summary.balance)}
			</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-xl border border-slate-200 p-4 mb-6">
		<form method="GET" action="/app/reports" class="grid grid-cols-2 md:grid-cols-5 gap-3">
			<div>
				<label class="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
				<select name="type" bind:value={filterType}
					class="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
					<option value="">Todos</option>
					<option value="income">Ingresos</option>
					<option value="expense">Gastos</option>
				</select>
			</div>
			<div>
				<label class="block text-xs font-medium text-slate-500 mb-1">Cuenta</label>
				<select name="account" bind:value={filterAccount}
					class="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
					<option value="">Todas</option>
					{#each accounts as acc}
						<option value={acc._id}>{acc.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
				<select name="category" bind:value={filterCategory}
					class="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
					<option value="">Todas</option>
					{#each categories as cat}
						<option value={cat._id}>{cat.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="block text-xs font-medium text-slate-500 mb-1">Desde</label>
				<input type="date" name="from" bind:value={filterFrom}
					class="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
			</div>
			<div>
				<label class="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
				<input type="date" name="to" bind:value={filterTo}
					class="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
			</div>
			<div class="col-span-full flex justify-end gap-2">
				<a href="/app/reports" class="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-300 rounded-lg">Limpiar</a>
				<button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white text-sm px-4 py-1.5 rounded-lg">Filtrar</button>
			</div>
		</form>
	</div>

	<!-- Report Table -->
	{#if report.data.length > 0}
		<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 text-left">
						<tr>
							<th class="px-4 py-3 font-medium text-slate-500">Fecha</th>
							<th class="px-4 py-3 font-medium text-slate-500">Tipo</th>
							<th class="px-4 py-3 font-medium text-slate-500">Descripcion</th>
							<th class="px-4 py-3 font-medium text-slate-500">Categoria</th>
							<th class="px-4 py-3 font-medium text-slate-500">Cuenta</th>
							<th class="px-4 py-3 font-medium text-slate-500 text-right">Monto</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each report.data as row}
							<tr class="hover:bg-slate-50">
								<td class="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(row.date)}</td>
								<td class="px-4 py-3">
									<span class="text-xs font-medium px-2 py-0.5 rounded-full {row.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
										{row.type === 'income' ? 'Ingreso' : 'Gasto'}
									</span>
								</td>
								<td class="px-4 py-3 text-slate-800">{row.description}</td>
								<td class="px-4 py-3 text-slate-500">{row.category?.name || '-'}</td>
								<td class="px-4 py-3 text-slate-500">{row.account?.name || '-'}</td>
								<td class="px-4 py-3 text-right font-semibold {row.type === 'income' ? 'text-green-600' : 'text-red-600'}">
									{formatCurrency(row.amount)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<p class="text-xs text-slate-400 mt-2">{report.data.length} transacciones encontradas</p>
	{:else}
		<div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
			<p class="text-slate-400 text-sm">No hay datos para los filtros seleccionados</p>
		</div>
	{/if}
</div>
