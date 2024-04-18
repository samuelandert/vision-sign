<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';

	let transactions = [];

	onMount(async () => {
		const address = '0xDdd18d4850E57E2AcD0672AB3A5aEC87F1f16818'; // Hardcoded PKP wallet address
		try {
			const { data } = await axios.get('https://api.gnosisscan.io/api', {
				params: {
					module: 'account',
					action: 'txlist',
					address: address,
					startblock: 0,
					endblock: 'latest',
					sort: 'desc',
					apikey: process.env.GNOSISSCAN_API
				}
			});
			transactions = data.result.map((transaction) => ({
				...transaction,
				timestamp: new Date(transaction.timeStamp * 1000).toISOString()
			}));
		} catch (error) {
			console.error('Failed to fetch transactions:', error);
		}
	});
</script>

<div>
	{#if transactions.length > 0}
		<ul>
			{#each transactions as transaction}
				<li>{transaction.hash} - {transaction.timestamp}</li>
			{/each}
		</ul>
	{:else}
		<p>No transactions found.</p>
	{/if}
</div>
