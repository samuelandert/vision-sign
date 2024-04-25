<script lang="ts">
	import Transactions from '$lib/components/Transactions.svelte';
	import { meStore, pkpWalletStore } from '$lib/stores';
	import { registerWithWebAuthn, authenticateWithWebAuthn } from '$lib/webAuthn';
	import { sendTxWithPKPWallet } from '$lib/sendTxWithPKPWallet';
	import Icon from '@iconify/svelte';

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
