<script lang="ts">
	let { data, form } = $props();
	let { category } = data;
	let name = $state(category.name);
	let type = $state(category.type);
	let color = $state(category.color);
</script>

<div class="max-w-xl">
	<div class="mb-6">
		<a href="/app/categories" class="text-sm text-blue-600 hover:text-blue-700">&larr; Volver a categorias</a>
		<h1 class="text-2xl font-bold text-slate-900 mt-2">Editar Categoria</h1>
	</div>

	<div class="bg-white rounded-xl border border-slate-200 p-6">
		<form method="POST">
			{#if form?.error}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{form.error}</div>
			{/if}

			<div class="mb-4">
				<label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
				<input id="name" name="name" type="text" required bind:value={name}
					class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
			</div>

			<div class="mb-4">
				<label for="type" class="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
				<select id="type" name="type" required bind:value={type}
					class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
					<option value="income">Ingreso</option>
					<option value="expense">Gasto</option>
				</select>
			</div>

			<div class="mb-6">
				<label for="color" class="block text-sm font-medium text-slate-700 mb-1">Color</label>
				<div class="flex items-center gap-3">
					<input id="color" name="color" type="color" bind:value={color}
						class="w-10 h-10 border border-slate-300 rounded-lg cursor-pointer" />
					<span class="text-sm text-slate-500">{color}</span>
				</div>
			</div>

			<button type="submit"
				class="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm">
				Guardar Cambios
			</button>
		</form>
	</div>
</div>
