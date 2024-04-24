<script>
	import '../app.css';
	import { pkpWalletStore, connectionStatusStore } from '$lib/stores';

	let pkpWalletSet = false;
	let connectionStatus = 'Disconnected';

	pkpWalletStore.subscribe(($pkpWalletStore) => {
		pkpWalletSet = $pkpWalletStore !== null;
	});

	connectionStatusStore.subscribe(($connectionStatus) => {
		connectionStatus = $connectionStatus;
	});
</script>

<div class="p-2 text-white text-center rounded {pkpWalletSet ? 'bg-green-500' : 'bg-yellow-500'}">
	{#if pkpWalletSet}
		PKP Wallet is set
	{:else}
		PKP Wallet is not set
	{/if}
</div>
<div class="p-2 text-center text-white bg-blue-500 rounded">
	{connectionStatus}
</div>
<slot />
