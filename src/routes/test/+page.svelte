<script>
	import { onMount } from 'svelte';
	import { persistBrowserSession } from '@macfja/svelte-persistent-store';
	import { writable } from 'svelte/store';
	import {
		meStore,
		litNodeClientStore,
		litProviderStore,
		ensureLitClientsAreInitialized,
		log
	} from '$lib/stores';

	let authMethodSession = persistBrowserSession(writable(null), 'authMethod');
	let authMethod;
	let provider, litNodeClient;

	onMount(async () => {
		await ensureLitClientsAreInitialized();

		litProviderStore.subscribe((value) => {
			provider = value;
		});
		litNodeClientStore.subscribe((value) => {
			litNodeClient = value;
		});

		if (!provider) {
			log('Provider is not initialized.');
			throw new Error('Provider is not initialized.');
		}
		authMethodSession.subscribe((value) => {
			authMethod = value;
		});

		if (!authMethod) {
			log('No authMethod in session, authenticating...');
			authMethod = await provider.authenticate();
			authMethodSession.set(authMethod);
			const pkps = await provider.fetchPKPsThroughRelayer(authMethod);
			if (pkps.length === 0) {
				log('No PKP found for authenticated method.');
				throw new Error('No PKP found for authenticated method.');
			}
			const pkpPublicKey = pkps[0].publicKey;
			const ethAddress = pkps[0].ethAddress;

			meStore.set({ pkpPubKey: pkpPublicKey, ethAddress: ethAddress });
		} else {
			log('Using existing authMethod from session');
		}
	});
</script>

{#if $meStore.pkpPubKey && authMethod}
	<p>Public Key: {$meStore.pkpPubKey}</p>
{:else if !authMethod}
	<p>Authenticating...</p>
{:else if !$meStore.pkpPubKey}
	<p>Invite only...</p>
{/if}
