<script>
	import '../app.css';
	import { pkpWalletStore } from '$lib/stores'; // Import the store

	let pkpWalletSet = false;

	pkpWalletStore.subscribe(($pkpWalletStore) => {
		pkpWalletSet = $pkpWalletStore !== null;
	});
</script>

<div class="p-2 text-white text-center rounded {pkpWalletSet ? 'bg-green-500' : 'bg-yellow-500'}">
	{#if pkpWalletSet}
		PKP Wallet is set
	{:else}
		PKP Wallet is not set
	{/if}
</div>
<slot />
