<script lang="ts">
	let { data, form } = $props();
	let { users } = data;

	let showForm = $state(false);
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let role = $state('contador');

	const roleLabels: Record<string, string> = {
		admin: 'Administrador',
		contador: 'Contador',
		viewer: 'Solo lectura'
	};
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Usuarios</h1>
			<p class="text-slate-500 text-sm mt-1">Gestiona los usuarios de tu empresa</p>
		</div>
		<button onclick={() => (showForm = !showForm)}
			class="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
			+ Nuevo Usuario
		</button>
	</div>

	{#if showForm}
		<div class="bg-white rounded-xl border border-slate-200 p-6 mb-6">
			<h3 class="text-base font-semibold text-slate-800 mb-4">Nuevo Usuario</h3>
			<form method="POST" action="?/create">
				{#if form?.error}
					<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{form.error}</div>
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div>
						<label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
						<input id="name" name="name" type="text" required bind:value={name}
							class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
					</div>
					<div>
						<label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
						<input id="email" name="email" type="email" required bind:value={email}
							class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
					</div>
					<div>
						<label for="password" class="block text-sm font-medium text-slate-700 mb-1">Contrasena</label>
						<input id="password" name="password" type="password" required bind:value={password}
							class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
					</div>
					<div>
						<label for="role" class="block text-sm font-medium text-slate-700 mb-1">Rol</label>
						<select id="role" name="role" required bind:value={role}
							class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
							<option value="contador">Contador</option>
							<option value="viewer">Solo lectura</option>
							<option value="admin">Administrador</option>
						</select>
					</div>
				</div>
				<div class="flex gap-2">
					<button type="submit"
						class="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
						Crear Usuario
					</button>
					<button type="button" onclick={() => (showForm = false)}
						class="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 border border-slate-300 rounded-lg">
						Cancelar
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-slate-50 text-left">
				<tr>
					<th class="px-4 py-3 font-medium text-slate-500">Nombre</th>
					<th class="px-4 py-3 font-medium text-slate-500">Email</th>
					<th class="px-4 py-3 font-medium text-slate-500">Rol</th>
					<th class="px-4 py-3 font-medium text-slate-500">Estado</th>
					<th class="px-4 py-3 font-medium text-slate-500">Creado</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each users as user}
					<tr class="hover:bg-slate-50">
						<td class="px-4 py-3 font-medium text-slate-800">{user.name}</td>
						<td class="px-4 py-3 text-slate-500">{user.email}</td>
						<td class="px-4 py-3">
							<span class="text-xs font-medium px-2 py-0.5 rounded-full {user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'contador' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}">
								{roleLabels[user.role] || user.role}
							</span>
						</td>
						<td class="px-4 py-3">
							<span class="text-xs font-medium px-2 py-0.5 rounded-full {user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
								{user.isActive ? 'Activo' : 'Inactivo'}
							</span>
						</td>
						<td class="px-4 py-3 text-slate-400 text-xs">
							{new Date(user.createdAt).toLocaleDateString('es-AR')}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
