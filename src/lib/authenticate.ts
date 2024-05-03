import { get, writable } from 'svelte/store';
import {
    meStore,
    litNodeClientStore,
    litProviderStore,
    ensureLitClientsAreInitialized,
    log,
    authMethodSession
} from './stores';

export async function initializeAuthentication() {
    await ensureLitClientsAreInitialized();

    let provider = get(litProviderStore);
    let litNodeClient = get(litNodeClientStore);

    if (!provider) {
        log('Provider is not initialized.');
        throw new Error('Provider is not initialized.');
    }

    let authMethod = get(authMethodSession);
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