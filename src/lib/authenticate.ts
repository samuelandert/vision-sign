import { get } from 'svelte/store';
import {
    meStore,
    litProviderStore,
    ensureLitClientsAreInitialized,
    log,
    authMethodSession,
} from './stores';
import { initPKPWallet } from './initPKPWallet';


export async function authenticate() {
    await ensureLitClientsAreInitialized();
    let provider = get(litProviderStore);

    if (!provider) {
        throw new Error('Provider is not initialized.');
    }
    let me = get(meStore)

    let authMethod = get(authMethodSession);
    if (!me.isLoggedIn) {
        log('No authMethod in session, authenticating...');
        authMethod = await provider.authenticate();
        if (authMethod) {
            log('Authentication successful.');
            authMethodSession.set(authMethod);
        } else {
            log('Authentication failed.');
            throw new Error('Authentication failed.');
        }

        const pkps = await provider.fetchPKPsThroughRelayer(authMethod);
        if (pkps.length === 0) {
            log('No PKP found for authenticated method.');
            throw new Error('No PKP found for authenticated method.');
        } else {
            log(`PKPs fetched successfully: ${pkps.length} PKP(s) found.`);
        }

        const pkpPublicKey = pkps[0].publicKey;
        const ethAddress = pkps[0].ethAddress;
        meStore.update(current => {
            return { ...current, pkpPubKey: pkpPublicKey, ethAddress: ethAddress, isLoggedIn: true };
        });
        log('User store updated with new PKP, Ethereum address, and login status.');

        // log('Initializing PKP Wallet...');
        // await initPKPWallet();
        // log('PKP Wallet initialization complete.');
    } else {
        // await initPKPWallet();
    }
}
