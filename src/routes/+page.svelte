<script lang="ts">
	import { onMount } from 'svelte';
	import { connectProvider, registerWithWebAuthn, authenticateWithWebAuthn } from '../lib/litSetup';
	import { browser } from '$app/environment';

	let isConnected = false;
	let pkpPublicKey = '';

	onMount(async () => {
		try {
			await connectProvider();
			isConnected = true;
			// Attempt to retrieve an existing passkey from local storage
			if (browser) {
				pkpPublicKey = localStorage.getItem('pkpPublicKey') || '';
			}
		} catch (error) {
			console.error('Failed to connect to provider:', error);
			isConnected = false;
		}
	});

	async function handleRegister() {
		try {
			pkpPublicKey = await registerWithWebAuthn();
			alert(`PKP Public Key: ${pkpPublicKey}`);
			// Store the new passkey in local storage
			if (browser) {
				localStorage.setItem('pkpPublicKey', pkpPublicKey);
			}
			// Automatically authenticate after registration
			await authenticate();
		} catch (error) {
			console.error('Registration failed:', error);
		}
	}

	async function handleSignIn() {
		if (!pkpPublicKey) {
			alert('No passkey found. Please register first.');
			return;
		}
		await authenticate();
	}

	async function authenticate() {
		try {
			const authMethod = await authenticateWithWebAuthn();
			console.log('Authentication successful:', authMethod);
		} catch (error) {
			console.error('Authentication failed:', error);
		}
	}
</script>

<div class="w-screen h-screen bg-orange-50">
	{#if isConnected}
		<div class="p-2 bg-yellow-400"><p>Lit Protocol is connected!</p></div>
		<div class="p-4">
			<button class="px-4 py-2 text-white rounded-lg bg-blue-950" on:click={handleRegister}
				>Register</button
			>
			<button class="px-4 py-2 text-white bg-green-500 rounded-lg" on:click={handleSignIn}
				>Sign In</button
			>
		</div>

		{#if pkpPublicKey}
			<p class="p-4">PKP Public Key: {pkpPublicKey}</p>
		{/if}
	{:else}
		<div class="p-2 bg-orange-400"><p>Connecting to Lit Protocol...</p></div>
	{/if}
</div>
