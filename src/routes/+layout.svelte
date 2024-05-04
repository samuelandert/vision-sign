<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { initializeLitClients } from '$lib/appInit';
	import LogViewer from '$lib/components/LogViewer.svelte';
	import { meStore } from '$lib/stores';
	import { handleLogout, refreshPage, sendCustomXDai, donateXDai, handleLogin } from '$lib/utility';
	import Icon from '@iconify/svelte';
	import { getJWT } from '$lib/jwt';

	let showLogViewer = writable(false);

	function toggleLogViewer() {
		showLogViewer.update((n) => !n);
	}

	onMount(async () => {
		await initializeLitClients();
	});

	async function fetchJWT() {
		try {
			const jwt = await getJWT();
			console.log('JWT fetched:', jwt);
		} catch (error) {
			console.error('Error fetching JWT:', error);
		}
	}
</script>

<div class="w-screen h-screen pb-20 bg-slate-50">
	{#if $showLogViewer}
		<LogViewer />
	{:else}
		<slot />
	{/if}
</div>

<div class="fixed bottom-0 left-0 right-0 flex justify-center mx-auto shadow-md">
	<div class="w-full max-w-6xl pb-1.5 bg-blue-950 rounded-t-3xl sm:p-0.5">
		<div class="inline-flex items-center justify-start w-full p-3 px-5 space-x-4">
			<img src="/logo.svg" alt="Logo" class="h-10 border-white rounded-full" />
			{#if $meStore.isLoggedIn}
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
				<button class="text-white rounded-full bg-blue-950" on:click={fetchJWT}>
					<Icon icon="solar:key-outline" class="w-10 h-10" />
				</button>
			{:else}
				<button class="px-4 py-2 bg-yellow-400 rounded-full text-blue-950" on:click={handleLogin}>
					Sign In
				</button>
			{/if}
			<button class="text-white rounded-full bg-blue-950" on:click={refreshPage}>
				<Icon icon="solar:refresh-circle-outline" class="w-10 h-10" />
			</button>
			<button class="text-white rounded-full bg-blue-950" on:click={toggleLogViewer}>
				<Icon icon="solar:document-text-outline" class="w-10 h-10" />
			</button>
		</div>
	</div>
</div>
