<script>
	import { onMount } from 'svelte';
	import { meStore, authMethodSession } from '$lib/stores';
	import { authenticate } from '$lib/authenticate';
	import Transactions from '$lib/components/Transactions.svelte';
	import Icon from '@iconify/svelte';

	let authMethod;

	onMount(async () => {
		try {
			await authenticate();
		} catch (error) {
			console.error('Authentication initialization failed:', error);
		}
		authMethodSession.subscribe((value) => {
			authMethod = value;
		});
	});
</script>

<div class="flex flex-col w-screen h-screen">
	<div class="flex-grow h-full overflow-auto">
		{#if $meStore.isLoggedIn && authMethod}
			<div class="flex justify-center p-4">
				<div class="w-full max-w-6xl">
					<Transactions />
				</div>
			</div>
		{:else if $meStore.isLoggedIn && !authMethod}
			<div class="flex flex-col items-center justify-center w-full h-full p-10">
				<Icon icon="icomoon-free:spinner9" class="mb-4 text-5xl text-blue-900 animate-spin" />
				<p>Authenticating...</p>
			</div>
		{:else if !$meStore.isLoggedIn}
			<div class="flex items-center justify-center flex-grow w-full h-full background-image">
				<p
					class="px-4 text-3xl font-bold text-center text-white uppercase break-words sm:text-6xl sm:px-0"
				>
					your true life starts now
				</p>
			</div>
		{:else if !$meStore}
			<p>Invite only..., please get an invite link</p>
		{/if}
	</div>
</div>

<style>
	.background-image {
		background-image: url('/freedom.jpeg');
		background-size: cover;
		background-position: center;
	}
</style>
