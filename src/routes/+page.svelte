<script lang="ts">
	import { onMount } from 'svelte';
	import { connectProvider, registerWithWebAuthn, authenticateWithWebAuthn } from '../lib/litSetup';
	import { browser } from '$app/environment';
	import { pkpWalletStore } from '$lib/stores';
	import { sendTxWithPKPWallet } from '$lib/sendTxWithPKPWallet';
	import Transactions from '$lib/components/Transactions.svelte';

	let isConnected = false;
	let ethAddress = '';
	let statusMessages: string[] = [];
	let isSignedIn = false;

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
				const litSessionKey = localStorage.getItem('lit-session-key');
				if (litWalletSig && litSessionKey) {
					isSignedIn = true;
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
				isSignedIn = true; // Update sign-in state
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
		isSignedIn = false; // Update sign-in state
		addStatusMessage('Logged out successfully.');
	}

	async function sendXDai() {
		let pkpWallet;
		const unsubscribe = pkpWalletStore.subscribe((value) => {
			pkpWallet = value;
		});
		unsubscribe(); // Immediately unsubscribe since we only need the current value

		if (!pkpWallet) {
			console.error('PKP Wallet not initialized.');
			return;
		}

		const recipientAddress = '0xRecipientAddressHere'; // Replace with the recipient's address
		await sendTxWithPKPWallet(pkpWallet);
	}
</script>

<div class="w-screen h-screen bg-orange-50 grid-container">
	<div class="p-4 left-content">
		{#if isConnected}
			{#if isSignedIn}
				<div>
					<button class="px-4 py-2 text-white bg-orange-400 rounded-lg" on:click={handleLogout}
						>Logout</button
					>
					<button on:click={sendXDai} class="px-4 py-2 text-white bg-teal-500 rounded-lg"
						>Send 0.01 xDai</button
					>
					{#if ethAddress}
						<p class="p-4">Address: {ethAddress}</p>
					{/if}
					<div class="transactions">
						<Transactions />
					</div>
				</div>
			{:else}
				<div>
					<button class="px-4 py-2 text-white rounded-lg bg-blue-950" on:click={handleRegister}
						>Register</button
					>
					<button class="px-4 py-2 text-white bg-green-500 rounded-lg" on:click={handleSignIn}
						>Sign In</button
					>
				</div>
			{/if}
		{:else}
			Loading
		{/if}
	</div>
	<div class="p-4 right-content">
		{#each statusMessages as message}
			<p>{message}</p>
		{/each}
	</div>
</div>

<style>
	.grid-container {
		display: grid;
		grid-template-columns: 3fr 1fr; /* This sets the main content to take up 3/4 of the page and the status messages 1/4 */
		gap: 1rem;
	}

	.full-width {
		grid-column: 1 / -1; /* This makes the element span the full width of the grid */
	}

	.left-content,
	.right-content {
		display: flex;
		flex-direction: column;
	}
</style>
