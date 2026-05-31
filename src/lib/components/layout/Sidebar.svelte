<script lang="ts">
	import { page } from '$app/stores';

	let { userName = '', userRole = '', tenantName = '' } = $props();

	let mobileOpen = $state(false);

	const navItems = [
		{ href: '/app', label: 'Dashboard', icon: '⊞' },
		{ href: '/app/transactions', label: 'Transacciones', icon: '↔' },
		{ href: '/app/accounts', label: 'Cuentas', icon: '◫' },
		{ href: '/app/categories', label: 'Categorias', icon: '☰' },
		{ href: '/app/reports', label: 'Reportes', icon: '▤' }
	];

	const adminItems = [
		{ href: '/admin/users', label: 'Usuarios', icon: '👤' }
	];

	let currentPath = $derived($page.url.pathname);

	function isActive(href: string) {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<!-- Mobile toggle -->
<button
	onclick={() => (mobileOpen = !mobileOpen)}
	class="fixed top-4 left-4 z-50 md:hidden bg-white border border-slate-200 rounded-lg p-2 shadow-sm"
	aria-label="Menu"
>
	<span class="text-slate-600 text-lg">{mobileOpen ? '✕' : '☰'}</span>
</button>

<!-- Overlay -->
{#if mobileOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		onclick={() => (mobileOpen = false)}
		class="fixed inset-0 bg-black/30 z-40 md:hidden"
	></div>
{/if}

<!-- Sidebar -->
<aside
	class="fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 md:translate-x-0 {mobileOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col"
>
	<div class="p-5 border-b border-slate-100">
		<h2 class="text-lg font-bold text-slate-900">FinPro</h2>
		<p class="text-xs text-slate-400 truncate">{tenantName}</p>
	</div>

	<nav class="flex-1 p-3 space-y-1 overflow-y-auto">
		{#each navItems as item}
			<a
				href={item.href}
				onclick={() => (mobileOpen = false)}
				class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition {isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}"
			>
				<span class="text-base w-5 text-center">{item.icon}</span>
				{item.label}
			</a>
		{/each}

		{#if userRole === 'admin'}
			<div class="pt-3 mt-3 border-t border-slate-100">
				<p class="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Admin</p>
				{#each adminItems as item}
					<a
						href={item.href}
						onclick={() => (mobileOpen = false)}
						class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition {isActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}"
					>
						<span class="text-base w-5 text-center">{item.icon}</span>
						{item.label}
					</a>
				{/each}
			</div>
		{/if}
	</nav>

	<div class="p-4 border-t border-slate-100">
		<div class="flex items-center justify-between">
			<div class="min-w-0">
				<p class="text-sm font-medium text-slate-800 truncate">{userName}</p>
				<p class="text-xs text-slate-400 capitalize">{userRole}</p>
			</div>
			<form method="POST" action="/logout">
				<button
					type="submit"
					class="text-xs text-slate-400 hover:text-red-600 transition px-2 py-1"
				>
					Salir
				</button>
			</form>
		</div>
	</div>
</aside>
