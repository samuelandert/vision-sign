<script lang="ts">
	import { onMount } from 'svelte';
	import { connectProvider, registerWithWebAuthn, authenticateWithWebAuthn } from '../lib/litSetup';
	import { browser } from '$app/environment';

	let isConnected = false;
	let pkpPublicKey = '';
	let ethAddress = '';
	let statusMessages: string[] = [];
	let me: { pkpPublicKey: string; ethAddress: string } | null = null;

	function addStatusMessage(message: string) {
		statusMessages = [...statusMessages, message];
	}

	function updateLocalStorage(pkpPublicKey: string, ethAddress: string, sessionSigs: string) {
		if (browser) {
			me = { pkpPublicKey, ethAddress };
			localStorage.setItem('me', JSON.stringify({ pkpPublicKey, ethAddress, sessionSigs }));
		}
	}

	onMount(async () => {
		try {
			addStatusMessage('Connecting to provider...');
			await connectProvider();
			isConnected = true;
			addStatusMessage('Provider connected.');
			if (browser) {
				const storedMe = localStorage.getItem('me');
				me = storedMe ? JSON.parse(storedMe) : null;
				pkpPublicKey = me?.pkpPublicKey || '';
				ethAddress = me?.ethAddress || '';
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
			const result = await registerWithWebAuthn(namedPasskey);
			pkpPublicKey = result.pkpPublicKey;
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
			console.log('Authentication successful:', result.authMethod);
			addStatusMessage('Authentication successful.');

			if (result.pkpPublicKey && result.ethAddress) {
				pkpPublicKey = result.pkpPublicKey;
				ethAddress = result.ethAddress;
				updateLocalStorage(pkpPublicKey, ethAddress, JSON.stringify(result.sessionSigs));
				addStatusMessage(`PKP Public Key and SessionSig fetched`);
			} else {
				addStatusMessage('No PKP Public Key or Eth Address received.');
			}
		} catch (error) {
			console.error('Error:', error);
			addStatusMessage('Authentication failed.');
		}
	}

	function handleLogout() {
		localStorage.removeItem('me');
		me = null;
		pkpPublicKey = '';
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
			{#if ethAddress || pkpPublicKey}
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
