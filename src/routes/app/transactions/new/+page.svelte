<script lang="ts">
	let { data, form } = $props();
	let { accounts, categories } = data;

	let type = $state(form?.values?.type || 'expense');
	let accountId = $state(form?.values?.accountId || '');
	let categoryId = $state(form?.values?.categoryId || '');
	let amount = $state(form?.values?.amount?.toString() || '');
	let description = $state(form?.values?.description || '');
	let dateStr = $state(form?.values?.dateStr || new Date().toISOString().split('T')[0]);
	let reference = $state(form?.values?.reference || '');
	let isScheduled = $state(form?.values?.isScheduled || false);

	let errors = $state(form?.errors || {});

	function getFilteredCategories() {
		return categories.filter((c: any) => c.type === type && c.isActive);
	}

	$effect(() => {
		const filtered = getFilteredCategories();
		if (filtered.length > 0 && !filtered.find((c: any) => c._id === categoryId)) {
			categoryId = filtered[0]._id;
		}
	});
</script>

<div class="max-w-2xl">
	<div class="mb-6">
		<a href="/app/transactions" class="text-sm text-blue-600 hover:text-blue-700">&larr; Volver a transacciones</a>
		<h1 class="text-2xl font-bold text-slate-900 mt-2">Nueva Transaccion</h1>
	</div>

	<div class="bg-white rounded-xl border border-slate-200 p-6">
		<form method="POST">
			{#if errors._form}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errors._form}</div>
			{/if}

			<!-- Type toggle -->
			<div class="mb-6">
				<label class="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
				<div class="flex rounded-lg border border-slate-300 overflow-hidden">
					<label class="flex-1 cursor-pointer">
						<input type="radio" name="type" value="expense" bind:group={type} class="sr-only" />
						<div class="text-center py-2.5 text-sm font-medium transition {type === 'expense' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}">
							Gasto
						</div>
					</label>
					<label class="flex-1 cursor-pointer">
						<input type="radio" name="type" value="income" bind:group={type} class="sr-only" />
						<div class="text-center py-2.5 text-sm font-medium transition {type === 'income' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}">
							Ingreso
						</div>
					</label>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<div>
					<label for="accountId" class="block text-sm font-medium text-slate-700 mb-1">Cuenta</label>
					<select id="accountId" name="accountId" required bind:value={accountId}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
						<option value="">Seleccionar cuenta</option>
						{#each accounts as acc}
							<option value={acc._id}>{acc.name}</option>
						{/each}
					</select>
					{#if errors.accountId}<p class="text-xs text-red-600 mt-1">{errors.accountId}</p>{/if}
				</div>

				<div>
					<label for="categoryId" class="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
					<select id="categoryId" name="categoryId" required bind:value={categoryId}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
						<option value="">Seleccionar categoria</option>
						{#each getFilteredCategories() as cat}
							<option value={cat._id}>{cat.name}</option>
						{/each}
					</select>
					{#if errors.categoryId}<p class="text-xs text-red-600 mt-1">{errors.categoryId}</p>{/if}
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<div>
					<label for="amount" class="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
					<input id="amount" name="amount" type="number" step="0.01" min="0.01" required bind:value={amount}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
						placeholder="1000.00" />
					{#if errors.amount}<p class="text-xs text-red-600 mt-1">{errors.amount}</p>{/if}
				</div>
				<div>
					<label for="date" class="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
					<input id="date" name="date" type="date" required bind:value={dateStr}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
					{#if errors.date}<p class="text-xs text-red-600 mt-1">{errors.date}</p>{/if}
				</div>
			</div>

			<div class="mb-4">
				<label for="description" class="block text-sm font-medium text-slate-700 mb-1">Descripcion</label>
				<input id="description" name="description" type="text" required bind:value={description}
					class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
					placeholder="Describe la transaccion..." />
				{#if errors.description}<p class="text-xs text-red-600 mt-1">{errors.description}</p>{/if}
			</div>

			<div class="mb-4">
				<label for="reference" class="block text-sm font-medium text-slate-700 mb-1">Referencia (opcional)</label>
				<input id="reference" name="reference" type="text" bind:value={reference}
					class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
					placeholder="Factura Nro, recibo, etc." />
			</div>

			<div class="mb-6">
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="isScheduled" bind:checked={isScheduled}
						class="w-4 h-4 text-blue-700 border-slate-300 rounded focus:ring-blue-500" />
					<span class="text-sm text-slate-600">Transaccion programada</span>
				</label>
			</div>

			<button type="submit"
				class="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm">
				Registrar Transaccion
			</button>
		</form>
	</div>
</div>
