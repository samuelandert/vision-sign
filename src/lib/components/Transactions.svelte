<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';
	import Time from 'svelte-time';
	import Icon from '@iconify/svelte';
	import { meStore } from '$lib/stores'; // Import meStore instead of pkpWalletStore

	let transactions = [];
	let balance = 0;
	let address = '';

	// Subscribe to meStore and extract the ethAddress
	$: $meStore, (address = $meStore.ethAddress || '');

	async function fetchBalanceAndTransactions() {
		if (!address) return; // Check if address is not empty
		try {
			const balanceResponse = await axios.get('https://api.gnosisscan.io/api', {
				params: {
					module: 'account',
					action: 'balance',
					address: address,
					tag: 'latest',
					apikey: process.env.GNOSISSCAN_API
				},
				timeout: 10000
			});
			balance = parseFloat(balanceResponse.data.result) / 1e18; // Convert Wei to Ether

			const transactionsResponse = await axios.get('https://api.gnosisscan.io/api', {
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
			transactions = transactionsResponse.data.result.map((transaction) => ({
				...transaction,
				timestamp: new Date(transaction.timeStamp * 1000),
				value: parseFloat(transaction.value) / 1e18
			}));
		} catch (error) {
			console.error('Failed to fetch data:', error);
		}
	}

	onMount(() => {
		fetchBalanceAndTransactions();
	});

	$: if (address) {
		fetchBalanceAndTransactions();
	}
</script>

{#if address}
	<div class="flex flex-col w-full p-5 mx-auto">
		<div class="p-5 pb-4 mb-5 bg-white rounded-lg">
			ACCOUNT
			<p class="text-xl">{address}</p>
		</div>
		<div class="p-5 pb-4 mb-5 bg-white rounded-lg">
			BALANCE
			<p class="text-5xl">{balance.toFixed(4)} $</p>
		</div>
		<div class="p-5 pb-4 mb-5 bg-white rounded-lg">
			{#if transactions.length > 0}
				<div class="pb-4">TRANSACTIONS</div>
				<ul class="pl-2 list-disc">
					{#each transactions as transaction (transaction.hash)}
						<li class="flex items-center justify-between mb-4">
							<div class="flex items-center">
								<Icon
									icon={transaction.to.toLowerCase() === address.toLowerCase()
										? 'ri:user-received-2-line'
										: 'ri:user-shared-line'}
									width="44"
									height="44"
								/>
								<div>
									<p class="pl-3 text-xl">
										{transaction.to.toLowerCase() === address.toLowerCase()
											? 'Received from'
											: 'Sent to'}
										{transaction.from.substring(0, 10)}...
									</p>
									<p class="pl-3 text-sm text-gray-500">
										{transaction.hash}
									</p>
								</div>
							</div>
							<div class="pr-2 text-right">
								<p class="text-2xl">
									{transaction.value.toFixed(3)} $
								</p>
								<p class="text-sm text-gray-500">
									<Time timestamp={transaction.timestamp} relative />
								</p>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No transactions found.</p>
			{/if}
		</div>
	</div>
{/if}
