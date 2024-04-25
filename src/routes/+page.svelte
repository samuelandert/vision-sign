<script lang="ts">
	import { onMount } from 'svelte';
	import Transactions from '$lib/components/Transactions.svelte';
	import { meStore, pkpWalletStore } from '$lib/stores';
	import { registerWithWebAuthn, authenticateWithWebAuthn } from '$lib/webAuthn';
	import { sendTxWithPKPWallet } from '$lib/sendTxWithPKPWallet';
	import { initPKPWalletConnect } from '$lib/initPKPWalletConnect';

	let isSignedIn = false;
	let pkpWalletConnect;

	meStore.subscribe(($me) => {
		isSignedIn = $me.pkpPubKey && $me.ethAddress;
	});

	onMount(async () => {
		pkpWalletConnect = await initPKPWalletConnect();
		pkpWalletConnect.on('session_proposal', async (proposal) => {
			console.log('Received session proposal:', proposal);
			await pkpWalletConnect.approveSessionProposal(proposal);
			const sessions = Object.values(pkpWalletConnect.getActiveSessions());
			for (const session of sessions) {
				const { name, url } = session.peer.metadata;
				console.log(`Active Session: ${name} (${url})`);
			}
		});
		pkpWalletConnect.on('session_request', async (requestEvent) => {
			console.log('Received session request:', requestEvent);
			const { topic, params } = requestEvent;
			const { request } = params;
			const requestSession = pkpWalletConnect.session.get(topic);
			const { name, url } = requestSession.peer.metadata;

			const userConfirmation = confirm(
				`Approve ${request.method} request for session ${name} (${url})?`
			);
			if (userConfirmation) {
				await pkpWalletConnect.approveSessionRequest(requestEvent);
				console.log(`Request approved. Check the ${name} dapp to confirm.`);
			} else {
				console.log(`Request declined.`);
			}
		});
	});

	async function handleRegister() {
		try {
			await registerWithWebAuthn('VisionID');
			isSignedIn = true;
		} catch (error) {
			console.error('Registration failed:', error);
		}
	}

	async function handleSignIn() {
		try {
			await authenticateWithWebAuthn();
			isSignedIn = true;
		} catch (error) {
			console.error('Authentication failed:', error);
		}
	}

	async function sendXDai() {
		try {
			await sendTxWithPKPWallet();
			console.log('Transaction successful');
		} catch (error) {
			console.error('Transaction failed:', error);
		}
	}

	function handleLogout() {
		meStore.set({});
		pkpWalletStore.set(null);
		localStorage.removeItem('lit-wallet-sig');
		localStorage.removeItem('lit-session-key');
		isSignedIn = false;
	}

	async function connectPKPWallet() {
		const uri = prompt('Please enter the URI to connect:');
		if (uri) {
			await pkpWalletConnect.pair({ uri });
		}
	}
</script>

<div class="w-screen h-screen bg-orange-50 grid-container">
	<div class="p-4 left-content">
		{#if isSignedIn}
			<div>
				<button class="px-4 py-2 bg-yellow-400 rounded-lg text-blue_950" on:click={handleLogout}
					>Logout</button
				>
				<button class="px-4 py-2 text-white bg-green-500 rounded-lg" on:click={sendXDai}
					>Send 0.01$</button
				>
				<button class="px-4 py-2 text-white bg-blue-500 rounded-lg" on:click={connectPKPWallet}
					>Connect Wallet</button
				>
				<!-- New button for connecting PKP Wallet -->
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
