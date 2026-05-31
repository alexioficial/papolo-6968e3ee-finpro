<script lang="ts">
	let { children, data } = $props();
</script>

<div class="p-6">
	<p class="text-sm text-slate-500">Usuario: {data.user?.name ?? '?'} | Empresa: {data.tenant?.name ?? '?'}</p>
	<main>
		{@render children()}
	</main>
</div>
