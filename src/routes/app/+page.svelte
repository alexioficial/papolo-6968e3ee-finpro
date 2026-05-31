<script lang="ts">
	let { data } = $props();

	const { summary, accounts, totalBalance } = data;

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
	}

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
	}
</script>

<div class="max-w-6xl">
	<div class="mb-6">
		<h1 class="text-2xl font-bold text-slate-900">Dashboard Financiero</h1>
		<p class="text-slate-500 text-sm mt-1">Resumen de tu actividad financiera</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
		<div class="bg-white rounded-xl border border-slate-200 p-5">
			<p class="text-xs font-medium text-green-600 uppercase tracking-wider">Ingresos del mes</p>
			<p class="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.monthlyIncome)}</p>
		</div>
		<div class="bg-white rounded-xl border border-slate-200 p-5">
			<p class="text-xs font-medium text-red-600 uppercase tracking-wider">Gastos del mes</p>
			<p class="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.monthlyExpenses)}</p>
		</div>
		<div class="bg-white rounded-xl border border-slate-200 p-5">
			<p class="text-xs font-medium text-blue-600 uppercase tracking-wider">Balance del mes</p>
			<p class="text-2xl font-bold {summary.monthlyBalance >= 0 ? 'text-green-700' : 'text-red-700'} mt-1">
				{formatCurrency(summary.monthlyBalance)}
			</p>
		</div>
		<div class="bg-white rounded-xl border border-slate-200 p-5">
			<p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Balance total</p>
			<p class="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalBalance)}</p>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
			<h2 class="text-base font-semibold text-slate-800 mb-4">Movimientos recientes</h2>

			{#if summary.recentTransactions.length > 0}
				<div class="space-y-3">
					{#each summary.recentTransactions as txn}
						<div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
							<div class="min-w-0 flex-1">
								<p class="text-sm font-medium text-slate-800 truncate">{txn.description}</p>
								<div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
									<span>{formatDate(txn.date)}</span>
									<span>·</span>
									<span class="truncate">{txn.categoryId?.name || 'Sin categoria'}</span>
									{#if txn.accountId?.name}
										<span>·</span>
										<span class="truncate">{txn.accountId.name}</span>
									{/if}
								</div>
							</div>
							<span class="text-sm font-semibold ml-4 {txn.type === 'income' ? 'text-green-600' : 'text-red-600'}">
								{txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-8 text-slate-400">
					<p class="text-sm">No hay movimientos registrados</p>
					<a href="/app/transactions/new" class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
						Crear primera transaccion
					</a>
				</div>
			{/if}
		</div>

		<div class="bg-white rounded-xl border border-slate-200 p-5">
			<h2 class="text-base font-semibold text-slate-800 mb-4">Cuentas</h2>

			{#if accounts.length > 0}
				<div class="space-y-3">
					{#each accounts as account}
						<div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
							<div>
								<p class="text-sm font-medium text-slate-800">{account.name}</p>
								<p class="text-xs text-slate-400 capitalize">{account.type}</p>
							</div>
							<span class="text-sm font-semibold text-slate-900">{formatCurrency(account.balance)}</span>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-8 text-slate-400">
					<p class="text-sm">No hay cuentas creadas</p>
					<a href="/app/accounts/new" class="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
						Crear cuenta
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
