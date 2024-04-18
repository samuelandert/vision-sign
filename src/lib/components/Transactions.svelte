<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';
	import Time from 'svelte-time';
	import Icon from '@iconify/svelte';
	import { pkpWalletStore } from '$lib/stores';

	let transactions = [];
	let balance = 0;
	let address = '';

	// Subscribe to pkpWalletStore and extract the address
	$: $pkpWalletStore, (address = $pkpWalletStore ? $pkpWalletStore.address : '');

	async function fetchBalanceAndTransactions() {
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

<div class="wallet-container">
	<div class="pb-4 account-info">
		ACCOUNT
		<p class="text-2xl">{address}</p>
	</div>
	<div class="pb-4 balance-info">
		BALANCE
		<p class="text-5xl">{balance.toFixed(4)} $</p>
	</div>
	<div class="pb-4 transactions-info">
		{#if transactions.length > 0}
			<div class="pb-4">TRANSACTIONS</div>
			<ul class="pl-5 list-disc">
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
								<p class="text-xl">
									{transaction.to.toLowerCase() === address.toLowerCase()
										? 'Received from'
										: 'Sent to'}
									{transaction.from.substring(0, 10)}...
								</p>
								<p class="text-sm text-gray-500">
									{transaction.hash}
								</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-2xl">
								{transaction.value.toFixed(4)} $
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

<style>
	.wallet-container {
		display: flex;
		flex-direction: column;
		padding: 20px;
		background-color: #f9fafb;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		width: 100%;
		height: full;
		margin: auto;
	}

	.account-info,
	.balance-info,
	.transactions-info {
		background-color: white;
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 20px;
	}

	.list-disc {
		list-style-type: disc;
	}

	.flex.items-center {
		display: flex;
		align-items: center;
	}
</style>
