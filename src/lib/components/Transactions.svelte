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

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(
			() => {
				// Handle successful copy, e.g., show a notification
			},
			(err) => {
				// Handle error
				console.error('Failed to copy text: ', err);
			}
		);
	}
</script>

{#if address}
	<div class="flex flex-col w-full mx-auto">
		<div class="px-4 py-2 mb-3 bg-white rounded-lg sm:p-5 sm:pb-4 sm:mb-5">
			ACCOUNT
			<div class="flex items-center space-x-1 sm:space-x-2">
				<p class="text-sm sm:text-xl">
					{address.length > 12 ? `${address.substring(0, 12)}...` : address}
				</p>
				<button
					class="p-1 text-xs bg-gray-200 rounded hover:bg-gray-300 sm:p-1"
					on:click={() => copyToClipboard(address)}
				>
					Copy
				</button>
			</div>
		</div>
		<div class="px-4 py-2 mb-3 bg-white rounded-lg sm:p-5 sm:pb-4 sm:mb-5">
			BALANCE
			<p class="text-3xl sm:text-5xl">{balance.toFixed(4)} $</p>
		</div>
		<div class="px-4 py-2 mb-3 bg-white rounded-lg sm:p-5 sm:pb-4 sm:mb-5">
			{#if transactions.length > 0}
				<div class="pb-2 sm:pb-4">TRANSACTIONS</div>
				<ul class="pl-1 list-disc sm:pl-2">
					{#each transactions as transaction (transaction.hash)}
						<li class="flex items-center justify-between mb-2 sm:mb-4">
							<div class="flex items-center">
								<div class="w-8 h-8 sm:w-12 sm:h-12">
									<Icon
										icon={transaction.to.toLowerCase() === address.toLowerCase()
											? 'ri:user-received-2-line'
											: 'ri:user-shared-line'}
										class="w-full h-full"
									/>
								</div>
								<div>
									<p class="pl-2 text-sm sm:text-xl">
										{transaction.to.toLowerCase() === address.toLowerCase()
											? 'Received from'
											: 'Sent to'}
										{transaction.from.length > 8
											? `${transaction.from.substring(0, 8)}...`
											: transaction.from}
									</p>
									<p class="pl-2 text-xs text-gray-500 sm:text-sm">
										{transaction.hash.length > 10
											? `${transaction.hash.substring(0, 10)}...`
											: transaction.hash}
									</p>
								</div>
							</div>
							<div class="pr-1 text-right sm:pr-2">
								<p class="text-sm sm:text-2xl">
									{transaction.value.toFixed(2)} $
								</p>
								<p class="text-xs text-gray-500 sm:text-sm">
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
