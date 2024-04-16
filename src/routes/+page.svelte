<script lang="ts">
	import { onMount } from 'svelte';
	import { connectLitNodeClient } from '../lib/litProviderSetup';

	let isConnected = false;

	onMount(async () => {
		isConnected = await connectLitNodeClient();
	});
</script>

{#if isConnected}
	<p>Lit Protocol is connected!</p>
{:else}
	<p>Connecting to Lit Protocol...</p>
{/if}
