<script lang="ts">
	import { registerWithWebAuthn } from '$lib/register';
	import { log } from '$lib/stores';

	let namedPasskey = 'Hominio';

	async function handleRegister() {
		if (namedPasskey.trim() === '') {
			log('Attempt to register with empty passkey');
			return;
		}
		try {
			await registerWithWebAuthn(namedPasskey);
			log(`Registration successful for passkey: ${namedPasskey}`);
		} catch (error) {
			log(`Registration failed: ${error.message}`);
		}
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
	<div class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
		<h1 class="mb-4 text-2xl font-bold text-center">Welcome to Our Platform</h1>
		<p class="mb-8 text-sm text-center text-gray-600">Please register your passkey to continue.</p>

		<button
			on:click={handleRegister}
			class="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
		>
			Register
		</button>
	</div>
</div>
