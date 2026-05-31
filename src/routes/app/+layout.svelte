<script lang="ts">
	let { children, data } = $props();
</script>

<div class="p-4">
	<p>User: {data.user?.name ?? 'unknown'} ({data.user?.role ?? 'none'})</p>
	<p>Tenant: {data.tenant?.name ?? 'none'}</p>
	<main>
		{@render children()}
	</main>
</div>
