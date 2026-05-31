<script lang="ts">
	let { data } = $props();
	const { categories, canWrite } = data;

	const incomeCategories = categories.filter((c: any) => c.type === 'income');
	const expenseCategories = categories.filter((c: any) => c.type === 'expense');
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Categorias</h1>
			<p class="text-slate-500 text-sm mt-1">Clasifica tus ingresos y gastos</p>
		</div>
		{#if canWrite}
			<a href="/app/categories/new"
				class="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
				+ Nueva Categoria
			</a>
		{/if}
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div>
			<h2 class="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3">Ingresos</h2>
			{#if incomeCategories.length > 0}
				<div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
					{#each incomeCategories as cat}
						<div class="flex items-center justify-between px-4 py-3">
							<div class="flex items-center gap-3">
								<span class="w-3 h-3 rounded-full" style="background-color: {cat.color}"></span>
								<span class="text-sm font-medium text-slate-800">{cat.name}</span>
							</div>
							{#if canWrite && cat.isActive}
								<a href="/app/categories/{cat._id}/edit" class="text-xs text-blue-600 hover:text-blue-700">Editar</a>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-400">
					No hay categorias de ingreso
				</div>
			{/if}
		</div>

		<div>
			<h2 class="text-sm font-semibold text-red-700 uppercase tracking-wider mb-3">Gastos</h2>
			{#if expenseCategories.length > 0}
				<div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
					{#each expenseCategories as cat}
						<div class="flex items-center justify-between px-4 py-3">
							<div class="flex items-center gap-3">
								<span class="w-3 h-3 rounded-full" style="background-color: {cat.color}"></span>
								<span class="text-sm font-medium text-slate-800">{cat.name}</span>
							</div>
							{#if canWrite && cat.isActive}
								<a href="/app/categories/{cat._id}/edit" class="text-xs text-blue-600 hover:text-blue-700">Editar</a>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-400">
					No hay categorias de gasto
				</div>
			{/if}
		</div>
	</div>
</div>
