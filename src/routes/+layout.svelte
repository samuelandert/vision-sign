<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { initializeLitClients } from '$lib/appInit';
	import LogViewer from '$lib/components/LogViewer.svelte';

	onMount(async () => {
		await initializeLitClients();
	});
</script>

<slot />
<LogViewer />
