<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { initializeLitClients } from '$lib/appInit';

	onMount(async () => {
		await initializeLitClients();
	});
</script>

<slot />
