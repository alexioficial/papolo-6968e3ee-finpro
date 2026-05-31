<script lang="ts">
	let { data } = $props();
	const { accounts, canWrite } = data;

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
	}

	const typeLabels: Record<string, string> = {
		bank: 'Banco',
		cash: 'Efectivo',
		credit_card: 'Tarjeta de Credito',
		investment: 'Inversion'
	};

	const typeColors: Record<string, string> = {
		bank: 'bg-blue-100 text-blue-700',
		cash: 'bg-green-100 text-green-700',
		credit_card: 'bg-orange-100 text-orange-700',
		investment: 'bg-purple-100 text-purple-700'
	};
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Cuentas</h1>
			<p class="text-slate-500 text-sm mt-1">Gestiona tus cuentas financieras</p>
		</div>
		{#if canWrite}
			<a
				href="/app/accounts/new"
				class="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
			>
				+ Nueva Cuenta
			</a>
		{/if}
	</div>

	{#if accounts.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each accounts as account}
				<div class="bg-white rounded-xl border border-slate-200 p-5 {!account.isActive ? 'opacity-60' : ''}">
					<div class="flex items-start justify-between mb-3">
						<div>
							<h3 class="font-semibold text-slate-900">{account.name}</h3>
							<span class="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 {typeColors[account.type] || 'bg-slate-100 text-slate-600'}">
								{typeLabels[account.type] || account.type}
							</span>
						</div>
						{#if !account.isActive}
							<span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Inactiva</span>
						{/if}
					</div>
					<p class="text-2xl font-bold text-slate-900">{formatCurrency(account.balance)}</p>
					<p class="text-xs text-slate-400 mt-1">{account.currency}</p>
					{#if canWrite && account.isActive}
						<div class="mt-3 pt-3 border-t border-slate-100">
							<a href="/app/accounts/{account._id}/edit" class="text-xs text-blue-600 hover:text-blue-700 font-medium">
								Editar
							</a>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
			<p class="text-slate-400 text-sm">No hay cuentas registradas</p>
			{#if canWrite}
				<a href="/app/accounts/new" class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
					Crear primera cuenta
				</a>
			{/if}
		</div>
	{/if}
</div>
