<script lang="ts">
	import { onMount } from 'svelte';
	import { connectProvider, registerWithWebAuthn, authenticateWithWebAuthn } from '../lib/litSetup';
	import { meStore, pkpWalletStore, wcClientStore } from '$lib/stores';
	import { sendTxWithPKPWallet } from '$lib/sendTxWithPKPWallet';
	import Transactions from '$lib/components/Transactions.svelte';

	let isConnected = false;
	let statusMessages: string[] = [];
	let isSignedIn = false;
	let wcClient;

	meStore.subscribe(($me) => {
		isSignedIn = $me.pkpPubKey && $me.ethAddress;
	});
	wcClientStore.subscribe((value) => {
		wcClient = value;
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
		pkpWalletStore.set(null);
		isSignedIn = false;
		addStatusMessage('Logged out successfully.');

		// Clearing lit-wallet-sig and lit-session-key from localStorage
		localStorage.removeItem('lit-wallet-sig');
		localStorage.removeItem('lit-session-key');
	}

	async function sendXDai() {
		try {
			addStatusMessage('Initiating transaction...');
			await sendTxWithPKPWallet();
			addStatusMessage('Transaction successful! Check your wallet.');
		} catch (error) {
			console.error('Transaction failed:', error);
			addStatusMessage('Transaction failed. Please try again.');
		}
	}

	async function handleConnectDapp() {
		const uri = prompt('Please enter the DApp URI:');
		if (!uri) {
			addStatusMessage('No URI provided.');
			return;
		}

		if (!wcClient) {
			addStatusMessage('WalletConnect client not initialized.');
			return;
		}

		// Retrieve the SignClient from the wcClient instance
		const signClient = wcClient.getSignClient();

		wcClient.on('session_proposal', async (proposal) => {
			console.log('Received session proposal: ', proposal);
			await wcClient.approveSessionProposal(proposal);
			addStatusMessage(`Connected to DApp: ${proposal.name}`);
		});

		wcClient.on('session_request', async (requestEvent) => {
			console.log('Received session request: ', requestEvent);

			const { topic, params } = requestEvent;
			const { request } = params;
			const requestSession = signClient.session.get(topic);
			const { name, url } = requestSession.peer.metadata;

			// Prompt user to approve or decline the session request
			const userApproval = confirm(
				`Approve ${request.method} request for session ${name} (${url})?`
			);
			if (userApproval) {
				await wcClient.approveSessionRequest(requestEvent);
				console.log(`Request approved. Check the ${name} dapp to confirm.`);
				addStatusMessage(`Request approved for ${name}.`);
			} else {
				await wcClient.rejectSessionRequest(requestEvent);
				console.log(`Request declined for ${name}.`);
				addStatusMessage(`Request declined for ${name}.`);
			}
		});

		try {
			await wcClient.pair({ uri });
			addStatusMessage('DApp connection initiated.');
		} catch (error) {
			console.error('DApp connection failed:', error);
			addStatusMessage('DApp connection failed.');
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
					<button class="px-4 py-2 text-white bg-blue-600 rounded-lg" on:click={handleConnectDapp}
						>Connect Dapp</button
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
