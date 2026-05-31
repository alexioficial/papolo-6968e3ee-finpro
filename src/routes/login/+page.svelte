<script lang="ts">
	let { form, data } = $props();

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-slate-900">FinPro</h1>
			<p class="text-slate-500 mt-1">Gestion financiera empresarial</p>
		</div>

		<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
			<h2 class="text-xl font-semibold text-slate-800 mb-6">Iniciar sesion</h2>

			<form method="POST">
				{#if form?.error}
					<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{form.error}
					</div>
				{/if}

				<div class="mb-4">
					<label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autocomplete="email"
						bind:value={email}
						class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
						placeholder="admin@empresa.com"
					/>
				</div>

				<div class="mb-6">
					<label for="password" class="block text-sm font-medium text-slate-700 mb-1">Contrasena</label>
					<div class="relative">
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							required
							autocomplete="current-password"
							bind:value={password}
							class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm pr-10"
							placeholder="••••••••"
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
						>
							{showPassword ? 'Ocultar' : 'Mostrar'}
						</button>
					</div>
				</div>

				<button
					type="submit"
					class="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm"
				>
					Entrar
				</button>
			</form>
		</div>

		<p class="text-center text-xs text-slate-400 mt-6">
			FinPro v1.0 &mdash; Sistema de Gestion Financiera
		</p>
	</div>
</div>
