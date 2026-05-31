<script lang="ts">
	let { data } = $props();
	let { transactions, pagination, accounts, categories, filters, canWrite } = data;

	let searchQuery = $state(filters.search || '');
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

	function buildFilterUrl(): string {
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (filterType) params.set('type', filterType);
		if (filterAccount) params.set('account', filterAccount);
		if (filterCategory) params.set('category', filterCategory);
		if (filterFrom) params.set('from', filterFrom);
		if (filterTo) params.set('to', filterTo);
		const qs = params.toString();
		return '/app/transactions' + (qs ? '?' + qs : '');
	}

	function goToPage(p: number) {
		const params = new URLSearchParams(window.location.search);
		params.set('page', p.toString());
		window.location.href = '/app/transactions?' + params.toString();
	}
</script>

<div class="max-w-6xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Transacciones</h1>
			<p class="text-slate-500 text-sm mt-1">Registra y administra tus movimientos</p>
		</div>
		{#if canWrite}
			<a href="/app/transactions/new"
				class="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
				+ Nueva Transaccion
			</a>
		{/if}
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-xl border border-slate-200 p-4 mb-6">
		<form method="GET" action="/app/transactions" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
			<div>
				<label class="block text-xs font-medium text-slate-500 mb-1">Buscar</label>
				<input type="text" name="q" bind:value={searchQuery} placeholder="Descripcion..."
					class="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
			</div>
			<div>
				<label class="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
				<select name="type" bind:value={filterType}
					class="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
					<option value="">Todos</option>
					<option value="income">Ingreso</option>
					<option value="expense">Gasto</option>
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
			<div class="col-span-full flex justify-end gap-2 mt-1">
				<a href="/app/transactions"
					class="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-300 rounded-lg">
					Limpiar
				</a>
				<button type="submit"
					class="bg-blue-700 hover:bg-blue-800 text-white text-sm px-4 py-1.5 rounded-lg">
					Filtrar
				</button>
			</div>
		</form>
	</div>

	<!-- Transactions List -->
	{#if transactions.length > 0}
		<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-slate-50 text-left">
						<tr>
							<th class="px-4 py-3 font-medium text-slate-500">Fecha</th>
							<th class="px-4 py-3 font-medium text-slate-500">Descripcion</th>
							<th class="px-4 py-3 font-medium text-slate-500">Categoria</th>
							<th class="px-4 py-3 font-medium text-slate-500">Cuenta</th>
							<th class="px-4 py-3 font-medium text-slate-500 text-right">Monto</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each transactions as txn}
							<tr class="hover:bg-slate-50">
								<td class="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(txn.date)}</td>
								<td class="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{txn.description}</td>
								<td class="px-4 py-3">
									<span class="inline-flex items-center gap-1.5">
										<span class="w-2 h-2 rounded-full" style="background-color: {txn.categoryId?.color || '#94a3b8'}"></span>
										<span class="text-slate-600">{txn.categoryId?.name || '-'}</span>
									</span>
								</td>
								<td class="px-4 py-3 text-slate-500">{txn.accountId?.name || '-'}</td>
								<td class="px-4 py-3 text-right font-semibold whitespace-nowrap {txn.type === 'income' ? 'text-green-600' : 'text-red-600'}">
									{txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pagination -->
		{#if pagination.totalPages > 1}
			<div class="flex items-center justify-between mt-4 text-sm">
				<p class="text-slate-500">
					Pagina {pagination.page} de {pagination.totalPages} ({pagination.total} transacciones)
				</p>
				<div class="flex gap-2">
					{#if pagination.page > 1}
						<button onclick={() => goToPage(pagination.page - 1)}
							class="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50">
							Anterior
						</button>
					{/if}
					{#if pagination.page < pagination.totalPages}
						<button onclick={() => goToPage(pagination.page + 1)}
							class="px-3 py-1.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800">
							Siguiente
						</button>
					{/if}
				</div>
			</div>
		{/if}
	{:else}
		<div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
			<p class="text-slate-400 text-sm">No se encontraron transacciones</p>
			{#if canWrite}
				<a href="/app/transactions/new" class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
					Crear primera transaccion
				</a>
			{/if}
		</div>
	{/if}
</div>
