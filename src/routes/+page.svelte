<script lang="ts">
	import { onMount } from 'svelte';
	import { connectProvider, registerWithWebAuthn, authenticateWithWebAuthn } from '../lib/litSetup';
	import { browser } from '$app/environment';

	let userId = '';
	let isConnected = false;
	let pkpPublicKey = '';
	let statusMessages: string[] = [];

	function addStatusMessage(message: string) {
		statusMessages = [...statusMessages, message];
	}

	onMount(async () => {
		try {
			addStatusMessage('Connecting to provider...');
			await connectProvider();
			isConnected = true;
			addStatusMessage('Provider connected.');
			if (browser) {
				pkpPublicKey = localStorage.getItem('pkpPublicKey') || '';
			}
		} catch (error) {
			console.error('Failed to connect to provider:', error);
			isConnected = false;
			addStatusMessage('Failed to connect to provider.');
		}
	});

	async function handleRegister() {
		try {
			addStatusMessage('Registering with WebAuthn...');
			pkpPublicKey = await registerWithWebAuthn();
			alert(`PKP Public Key: ${pkpPublicKey}`);
			addStatusMessage('WebAuthn registration successful.');
			if (browser) {
				localStorage.setItem('pkpPublicKey', pkpPublicKey);
			}
		} catch (error) {
			console.error('Registration failed:', error);
			addStatusMessage('Registration failed.');
		}
	}

	async function handleSignIn() {
		// Check if pkpPublicKey is available. If not, try to authenticate to see if the user can sign in without registering again.
		if (!pkpPublicKey) {
			try {
				addStatusMessage('Attempting to sign in...');
				const authMethod = await authenticateWithWebAuthn();
				console.log('Sign in successful:', authMethod);
				addStatusMessage('Sign in successful.');
			} catch (error) {
				console.error('Sign in error:', error);
				addStatusMessage('No passkey found. Please register first.');
				// Optionally, prompt the user to register if authentication fails due to missing passkey.
				// This could be a UI prompt or simply logging a message as done here.
			}
			return;
		}

		// If pkpPublicKey exists, proceed with the existing sign-in logic.
		try {
			addStatusMessage('Authenticating...');
			const authMethod = await authenticateWithWebAuthn();
			console.log('Authentication successful:', authMethod);
			addStatusMessage('Authentication successful.');
		} catch (error) {
			console.error('Error:', error);
			addStatusMessage('Authentication failed.');
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
	<div class="p-4">
		{#each statusMessages as message}
			<p>{message}</p>
		{/each}
	</div>
</div>
