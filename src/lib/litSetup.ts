import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

// Initialize the LitAuthClient with your Lit Relay Server API key
const litAuthClient = new LitAuthClient({
    litRelayConfig: {
        relayApiKey: 'test-api-key', // Replace with your actual API key
    },
});

let provider;

export async function connectProvider() {
    const litNodeClient = new LitNodeClient({
        litNetwork: 'manzano',
        debug: true,
    });
    await litNodeClient.connect();

    litAuthClient.litNodeClient = litNodeClient;
    provider = await litAuthClient.initProvider(ProviderType.WebAuthn);

    return provider;
}

export async function registerWithWebAuthn() {
    if (!provider) {
        throw new Error('Provider is not initialized.');
    }
    // Register new WebAuthn credential
    const options = await provider.register();

    // Verify registration and mint PKP through relay server
    const txHash = await provider.verifyAndMintPKPThroughRelayer(options);
    const response = await provider.relay.pollRequestUntilTerminalState(txHash);

    // Return public key of newly minted PKP
    return response.pkpPublicKey;
}

export async function authenticateWithWebAuthn() {
    if (!provider) {
        throw new Error('Provider is not initialized.');
    }
    const authMethod = await provider.authenticate();
    return authMethod;
}