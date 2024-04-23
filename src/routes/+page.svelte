<script lang="ts">
	import { onMount } from 'svelte';
	import { connectProvider, registerWithWebAuthn, authenticateWithWebAuthn } from '../lib/litSetup';
	import { meStore } from '$lib/stores'; // Use only meStore
	import { sendTxWithPKPWallet } from '$lib/sendTxWithPKPWallet';
	import Transactions from '$lib/components/Transactions.svelte';
	import { pkpWalletStore } from '$lib/stores';

	let isConnected = false;
	let statusMessages: string[] = [];
	let isSignedIn = false;

	// Subscribe to meStore to update local variables
	meStore.subscribe(($me) => {
		isSignedIn = $me.pkpPubKey && $me.ethAddress;
	});

	function addStatusMessage(message: string) {
		statusMessages = [...statusMessages, message];
	}

	onMount(async () => {
		try {
			addStatusMessage('Connecting to provider...');
			await connectProvider();
			isConnected = true;
			addStatusMessage('Provider connected.');
		} catch (error) {
			console.error('Failed to connect to provider:', error);
			isConnected = false;
			addStatusMessage('Failed to connect to provider.');
		}
	});

	async function handleRegister() {
		try {
			addStatusMessage('Registering with WebAuthn...');
			await registerWithWebAuthn('VisionID');
			addStatusMessage('WebAuthn registration successful.');
			isSignedIn = true;
		} catch (error) {
			console.error('Registration failed:', error);
			addStatusMessage('Registration failed.');
		}
	}

	async function handleSignIn() {
		try {
			addStatusMessage('Authenticating...');
			await authenticateWithWebAuthn();
			addStatusMessage('Authentication successful.');
			isSignedIn = true;
		} catch (error) {
			console.error('Authentication failed:', error);
			addStatusMessage('Authentication failed.');
		}
	}

	function handleLogout() {
		meStore.set({});
		isSignedIn = false;
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
			addStatusMessage('PKP Wallet not initialized.'); // Inform the user
			return;
		}

		try {
			addStatusMessage('Initiating transaction...');
			await sendTxWithPKPWallet(pkpWallet);
			addStatusMessage('Transaction successful! Check your wallet.'); // Inform the user of success
		} catch (error) {
			console.error('Transaction failed:', error);
			addStatusMessage('Transaction failed. Please try again.'); // Inform the user of failure
		}
	}
</script>

<div class="w-screen h-screen bg-orange-50 grid-container">
	<div class="p-4 left-content">
		{#if isConnected}
			{#if isSignedIn}
				<div>
					<button class="px-4 py-2 bg-yellow-400 rounded-lg text-blue_950" on:click={handleLogout}
						>Logout</button
					>
					<button class="px-4 py-2 text-white bg-green-500 rounded-lg" on:click={sendXDai}
						>Send 0.01$</button
					>
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
			Loading...
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
		grid-template-columns: 3fr 1fr;
		gap: 1rem;
	}

	.left-content,
	.right-content {
		display: flex;
		flex-direction: column;
	}
</style>
