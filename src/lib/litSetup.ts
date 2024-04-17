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

export async function registerWithWebAuthn(namedPasskey: string) {
    if (!provider) {
        throw new Error('Provider is not initialized.');
    }
    // Generate registration options with the named passkey (username)
    const options = await provider.register(namedPasskey);

    // Proceed with the registration process using the generated options
    const txHash = await provider.verifyAndMintPKPThroughRelayer(options);
    const response = await provider.relay.pollRequestUntilTerminalState(txHash);

    // Assuming response contains both pkpPublicKey and ethAddress
    return { pkpPublicKey: response.pkpPublicKey, ethAddress: response.ethAddress };
}

export async function authenticateWithWebAuthn() {
    if (!provider) {
        throw new Error('Provider is not initialized.');
    }
    const authMethod = await provider.authenticate();

    const pkps = await provider.fetchPKPsThroughRelayer(authMethod);

    // Adjusted to also return ethAddress
    const pkpPublicKey = pkps.length > 0 ? pkps[0].publicKey : null;
    const ethAddress = pkps.length > 0 ? pkps[0].ethAddress : null;
    return { authMethod, pkpPublicKey, ethAddress };
}