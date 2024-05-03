<script>
	import { onMount } from 'svelte';
	import { meStore, authMethodSession } from '$lib/stores';
	import { initializeAuthentication } from '$lib/authenticate';

	let authMethod;

	onMount(async () => {
		try {
			await initializeAuthentication();
		} catch (error) {
			console.error('Authentication initialization failed:', error);
		}

		authMethodSession.subscribe((value) => {
			authMethod = value;
		});
	});
</script>

{#if $meStore.pkpPubKey && authMethod}
	<p>Public Key: {$meStore.pkpPubKey}</p>
{:else if !authMethod}
	<p>Authenticating...</p>
{:else if !$meStore.pkpPubKey}
	<p>Invite only..., please get an invite link</p>
{/if}
