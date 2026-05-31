<script lang="ts">
	let { children, data } = $props();
</script>

<div class="flex min-h-screen">
	<aside class="w-64 bg-white border-r border-slate-200 flex flex-col">
		<div class="p-5 border-b border-slate-100">
			<h2 class="text-lg font-bold text-slate-900">FinPro</h2>
			<p class="text-xs text-slate-400 truncate">{data.tenant?.name ?? ''}</p>
		</div>
		<nav class="flex-1 p-3 space-y-1">
			<a href="/app" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700">Dashboard</a>
			<a href="/app/transactions" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600">Transacciones</a>
			<a href="/app/accounts" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600">Cuentas</a>
			<a href="/app/categories" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600">Categorias</a>
			<a href="/app/reports" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600">Reportes</a>
		</nav>
		<div class="p-4 border-t border-slate-100">
			<p class="text-sm font-medium text-slate-800">{data.user?.name ?? ''}</p>
			<p class="text-xs text-slate-400 capitalize">{data.user?.role ?? ''}</p>
		</div>
	</aside>
	<main class="flex-1 p-4 md:p-8">
		{@render children()}
	</main>
</div>
