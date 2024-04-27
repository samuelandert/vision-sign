<script lang="ts">
	import Transactions from '$lib/components/Transactions.svelte';
	import { meStore, pkpWalletStore } from '$lib/stores';
	import { registerWithWebAuthn, authenticateWithWebAuthn } from '$lib/webAuthn';
	import { sendTxWithPKPWallet } from '$lib/sendTxWithPKPWallet';
	import Icon from '@iconify/svelte';
	import { initPKPWalletConnect } from '$lib/initPKPWalletConnect';
	import { onMount } from 'svelte';

	let pkpWalletConnect;
	let userAddress;
	let isSignedIn = false;

	meStore.subscribe(($me) => {
		isSignedIn = $me.pkpPubKey && $me.ethAddress;
	});

	onMount(async () => {
		pkpWalletConnect = await initPKPWalletConnect();
		const signClient = pkpWalletConnect.getSignClient();
		const walletSig = localStorage.getItem('lit-wallet-sig');
		if (walletSig) {
			const walletData = JSON.parse(walletSig);
			userAddress = walletData.address;
		}
		let address = pkpWalletConnect?.getAccounts();
		console.log('accounts', address);
		pkpWalletConnect.on('session_proposal', async (proposal) => {
			console.log('Received session proposal: ', proposal);

			// Extracting chain IDs from the proposal
			const chains = proposal.params.optionalNamespaces?.eip155?.chains || [];
			console.log('Proposed Chains:', chains);

			if (chains.includes('eip155:1')) {
				// Check for Ethereum Mainnet
				console.log('Ethereum Mainnet is included in the proposal, approving session...');

				// Use SignClient to approve the session proposal
				await signClient.approve({
					id: proposal.id,
					relayProtocol: proposal.relayProtocol,
					namespaces: {
						eip155: {
							accounts: [`eip155:1:${userAddress}`],
							methods: proposal.params.optionalNamespaces.eip155.methods,
							events: proposal.params.optionalNamespaces.eip155.events,
							chains: ['eip155:1']
						}
					}
				});

				console.log('Session approved for Ethereum Mainnet');
			} else {
				console.log('Ethereum Mainnet is not supported in this proposal, rejecting session...');
				await signClient.reject({
					id: proposal.id,
					reason: 'Unsupported chain'
				});
			}

			// Log active sessions
			const sessions = Object.values(pkpWalletConnect.getActiveSessions());
			for (const session of sessions) {
				const { name, url } = session.peer.metadata;
				console.log(`Active Session: ${name} (${url})`);
			}
		});
		pkpWalletConnect.on('session_request', async (requestEvent) => {
			console.log('Received session request: ', requestEvent);

			const { topic, params } = requestEvent;
			const { request } = params;
			const signClient = pkpWalletConnect.getSignClient(); // Retrieve the SignClient instance
			const requestSession = signClient.session.get(topic);
			const { name, url } = requestSession.peer.metadata;

			const userConfirm = confirm(
				`Approve ${request.method} request for session ${name} (${url})?`
			);
			if (userConfirm) {
				await pkpWalletConnect.approveSessionRequest(requestEvent);
				console.log(`Request approved for ${name}`);
			} else {
				console.log(`Request denied for ${name}`);
			}
		});
	});

	async function handleRegister() {
		try {
			await registerWithWebAuthn('Hominio');
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

	async function donateXDai() {
		try {
			await sendTxWithPKPWallet('0.01', '0xD2BEe43813d976104A3CE1251374AbE7a93A99d2');
			console.log('Transaction successful');
		} catch (error) {
			console.error('Transaction failed:', error);
		}
	}

	async function sendCustomXDai() {
		const amount = prompt('Enter the amount of xDai to send:');
		const address = prompt("Enter the recipient's address:");
		if (amount && address) {
			try {
				await sendTxWithPKPWallet(amount, address);
				console.log('Custom transaction successful');
			} catch (error) {
				console.error('Custom transaction failed:', error);
			}
		}
	}

	function handleLogout() {
		meStore.set({});
		pkpWalletStore.set(null);
		localStorage.removeItem('lit-wallet-sig');
		localStorage.removeItem('lit-session-key');
		isSignedIn = false;
	}

	function refreshPage() {
		window.location.reload();
	}

	async function connectPKPWallet() {
		const uri = prompt('Please enter the URI to connect:');
		if (uri) {
			await pkpWalletConnect.pair({ uri });
		}
	}
</script>

<div class="flex flex-col w-screen h-screen">
	<div class="flex-grow h-full overflow-auto">
		{#if isSignedIn}
			<div class="flex justify-center p-4">
				<div class="w-full max-w-6xl">
					<Transactions />
				</div>
			</div>
		{:else}
			<div class="flex items-center justify-center flex-grow w-full h-full background-image">
				<p
					class="px-4 text-3xl font-bold text-center text-white uppercase break-words sm:text-6xl sm:px-0"
				>
					your true life starts now
				</p>
			</div>
		{/if}
	</div>
	<div class="fixed bottom-0 left-0 right-0 flex justify-center mx-auto shadow-md">
		<div class="w-full max-w-6xl pb-1.5 bg-blue-950 rounded-t-3xl sm:p-0.5">
			<div class="inline-flex items-center justify-start w-full p-3 px-5 space-x-4">
				<img src="/logo.svg" alt="Logo" class="h-10 border-white rounded-full" />

				{#if isSignedIn}
					<button class="text-white rounded-full bg-blue-950" on:click={handleLogout}>
						<Icon icon="solar:logout-outline" class="w-10 h-10" />
					</button>
					<button class="text-white rounded-full bg-blue-950" on:click={sendCustomXDai}>
						<Icon icon="solar:card-send-outline" class="w-10 h-10" />
					</button>
					<button class="px-4 py-2 text-white bg-blue-500 rounded-lg" on:click={connectPKPWallet}
						>Connect Wallet</button
					>
					<button
						class="px-3 py-2 text-sm bg-yellow-400 rounded-full text-blue-950"
						on:click={donateXDai}
					>
						Donate 0.01$
					</button>
				{:else}
					<button
						class="px-4 py-2 bg-yellow-400 rounded-full text-blue-950"
						on:click={handleSignIn}
					>
						Sign In
					</button>
					<button class="px-4 py-2 text-white rounded-full bg-cyan-600" on:click={handleRegister}>
						Register
					</button>
				{/if}
				<button class="text-white rounded-full bg-blue-950" on:click={refreshPage}>
					<Icon icon="solar:refresh-circle-outline" class="w-10 h-10" />
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.background-image {
		background-image: url('/freedom.jpeg');
		background-size: cover;
		background-position: center;
	}
</style>
