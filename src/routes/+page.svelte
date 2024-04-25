<script lang="ts">
	import Transactions from '$lib/components/Transactions.svelte';
	import { meStore, pkpWalletStore } from '$lib/stores';
	import { registerWithWebAuthn, authenticateWithWebAuthn } from '$lib/webAuthn';
	import { sendTxWithPKPWallet } from '$lib/sendTxWithPKPWallet';

	let isSignedIn = false;

	meStore.subscribe(($me) => {
		isSignedIn = $me.pkpPubKey && $me.ethAddress;
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
</script>

<div class="flex flex-col w-screen h-screen bg-gray-100">
	<div class="flex-grow h-full p-4 overflow-auto">
		{#if isSignedIn}
			<div class="transactions">
				<Transactions />
			</div>
		{:else}
			<div class="flex items-center justify-center flex-grow h-full">
				<img src="/logo.svg" alt="Logo" class="w-60 h-60" />
			</div>
		{/if}
	</div>
	<div
		class="fixed bottom-0 left-0 right-0 flex justify-center mx-auto shadow-md rounded-t-3xl bg-blue-950"
	>
		<div class="inline-flex items-center justify-start w-full p-3 px-5 space-x-4">
			<img src="/logo.svg" alt="Logo" class="h-10 border-2 border-white rounded-full" />
			{#if isSignedIn}
				<button class="px-4 py-2 text-white bg-blue-900 rounded-full" on:click={handleLogout}>
					Logout
				</button>
				<button class="px-4 py-2 text-white bg-green-500 rounded-full" on:click={sendXDai}>
					Donate 0.01$
				</button>
			{:else}
				<button
					class="px-4 py-2 bg-yellow-400 rounded-full text-blue-950"
					on:click={handleRegister}
				>
					Register
				</button>
				<button class="px-4 py-2 text-white bg-green-500 rounded-full" on:click={handleSignIn}>
					Sign In
				</button>
			{/if}
		</div>
	</div>
</div>
