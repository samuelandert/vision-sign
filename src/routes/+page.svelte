<script lang="ts">
	import { onMount } from 'svelte';
	import { connectProvider, registerWithWebAuthn, authenticateWithWebAuthn } from '../lib/litSetup';

	let isConnected = false;
	let pkpPublicKey = '';

	onMount(async () => {
		try {
			await connectProvider();
			isConnected = true;
		} catch (error) {
			console.error('Failed to connect to provider:', error);
			isConnected = false;
		}
	});

	async function handleSignIn() {
		// Check if a pkpPublicKey already exists
		if (!pkpPublicKey) {
			// No passkey exists, proceed with registration
			try {
				pkpPublicKey = await registerWithWebAuthn();
				alert(`PKP Public Key: ${pkpPublicKey}`);
				// After registration, automatically proceed with authentication
				await authenticate();
			} catch (error) {
				console.error('Registration failed:', error);
				return; // Exit the function if registration fails
			}
		} else {
			// Passkey exists, proceed with authentication
			await authenticate();
		}
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

{#if isConnected}
	<p>Lit Protocol is connected!</p>
	<div class="p-4">
		<button class="px-4 py-2 text-white rounded-lg bg-blue-950" on:click={handleSignIn}
			>Sign In</button
		>
	</div>

	{#if pkpPublicKey}
		<p>PKP Public Key: {pkpPublicKey}</p>
	{/if}
{:else}
	<p>Connecting to Lit Protocol...</p>
{/if}
