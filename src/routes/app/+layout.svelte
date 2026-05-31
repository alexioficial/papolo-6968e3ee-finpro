<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	let { children, data } = $props();
</script>

<Sidebar
	userName={data.user?.name ?? ''}
	userRole={data.user?.role ?? ''}
	tenantName={data.tenant?.name ?? ''}
	currentPath=""
/>

<main class="md:ml-64 min-h-screen p-4 md:p-8 pt-16 md:pt-8">
	{@render children()}
</main>
