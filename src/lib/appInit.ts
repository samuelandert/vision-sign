import { litNodeClientStore, litProviderStore, connectionStatusStore } from './stores';
import { ProviderType } from '@lit-protocol/constants';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

export async function initializeLitClients() {
    const litNodeClient = new LitNodeClient({
        litNetwork: 'cayenne',
        debug: true,
    });
    try {
        await litNodeClient.connect();
        litNodeClientStore.set(litNodeClient);
        connectionStatusStore.set('Lit Node Client Connected');
    } catch (error) {
        connectionStatusStore.set('Failed to connect Lit Node Client');
        console.error(error);
    }

    const litAuthClient = new LitAuthClient({
        litRelayConfig: {
            relayApiKey: 'test-api-key',
        },
    });
    litAuthClient.litNodeClient = litNodeClient;

    try {
        const provider = await litAuthClient.initProvider(ProviderType.WebAuthn);
        litProviderStore.set(provider);
        connectionStatusStore.set('Lit Provider Initialized');
    } catch (error) {
        connectionStatusStore.set('Failed to initialize Lit Provider');
        console.error(error);
    }
}