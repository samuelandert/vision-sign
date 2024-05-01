import { writable } from 'svelte/store';
import { persistBrowserSession } from '@macfja/svelte-persistent-store';
import {
    meStore,
    litNodeClientStore,
    litProviderStore,
    ensureLitClientsAreInitialized,
    log
} from './stores';

export let authMethodSession = persistBrowserSession(writable(null), 'authMethod');

export async function initializeAuth() {
    await ensureLitClientsAreInitialized();

    let provider, litNodeClient;

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
}