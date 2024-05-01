<script>
	import { onMount } from 'svelte';
	import { persistBrowserSession } from '@macfja/svelte-persistent-store';
	import { writable } from 'svelte/store';
	import {
		meStore,
		litNodeClientStore,
		litProviderStore,
		ensureLitClientsAreInitialized,
		addLog
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
			addLog('Provider is not initialized.', import.meta.url);
			throw new Error('Provider is not initialized.');
		}
		authMethodSession.subscribe((value) => {
			authMethod = value;
		});

		if (!authMethod) {
			addLog('No authMethod in session, authenticating...', import.meta.url);
			authMethod = await provider.authenticate();
			authMethodSession.set(authMethod);
			const pkps = await provider.fetchPKPsThroughRelayer(authMethod);
			if (pkps.length === 0) {
				addLog('No PKP found for authenticated method.', import.meta.url);
				throw new Error('No PKP found for authenticated method.');
			}
			const pkpPublicKey = pkps[0].publicKey;
			const ethAddress = pkps[0].ethAddress;

			meStore.set({ pkpPubKey: pkpPublicKey, ethAddress: ethAddress });
		} else {
			addLog('Using existing authMethod from session', import.meta.url);
		}
	});
</script>
