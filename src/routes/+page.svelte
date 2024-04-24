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
