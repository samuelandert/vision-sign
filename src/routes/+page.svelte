<script lang="ts">
	import { onMount } from 'svelte';
	import { connectProvider, registerWithWebAuthn, authenticateWithWebAuthn } from '../lib/litSetup';
	import { browser } from '$app/environment';

	let isConnected = false;
	let ethAddress = '';
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
				const litWalletSig = localStorage.getItem('lit-wallet-sig');
				if (litWalletSig) {
					const { address } = JSON.parse(litWalletSig);
					ethAddress = address;
				}
			}
		} catch (error) {
			console.error('Failed to connect to provider:', error);
			isConnected = false;
			addStatusMessage('Failed to connect to provider.');
		}
	});

	async function handleRegister() {
		try {
			const namedPasskey = 'VisionID';
			addStatusMessage('Registering with WebAuthn...');
			await registerWithWebAuthn(namedPasskey);
			addStatusMessage('WebAuthn registration successful.');
			await handleSignIn();
		} catch (error) {
			console.error('Registration failed:', error);
			addStatusMessage('Registration failed.');
		}
	}

	async function handleSignIn() {
		try {
			addStatusMessage('Authenticating...');
			const result = await authenticateWithWebAuthn();
			addStatusMessage('Authentication successful.');

			if (result.ethAddress) {
				ethAddress = result.ethAddress;
				addStatusMessage(`Authentication details fetched.`);
			} else {
				addStatusMessage('No Eth Address received.');
			}
		} catch (error) {
			console.error('Error:', error);
			addStatusMessage('Authentication failed.');
		}
	}

	function handleLogout() {
		localStorage.removeItem('lit-wallet-sig');
		localStorage.removeItem('lit-session-key');
		ethAddress = '';
		addStatusMessage('Logged out successfully.');
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
			{#if ethAddress}
				<button class="px-4 py-2 text-white bg-orange-400 rounded-lg" on:click={handleLogout}
					>Logout</button
				>
			{/if}
		</div>

		{#if ethAddress}
			<p class="p-4">Address: {ethAddress}</p>
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
