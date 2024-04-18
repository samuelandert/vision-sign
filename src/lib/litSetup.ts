import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';

// Initialize the LitAuthClient with your Lit Relay Server API key
const litAuthClient = new LitAuthClient({
    litRelayConfig: {
        relayApiKey: 'test-api-key', // Replace with your actual API key
    },
});

let provider;

export async function connectProvider() {
    const litNodeClient = new LitNodeClient({
        litNetwork: 'cayenne',
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
    const options = await provider.register(namedPasskey);
    const txHash = await provider.verifyAndMintPKPThroughRelayer(options);
    const response = await provider.relay.pollRequestUntilTerminalState(txHash);
    return { pkpPublicKey: response.pkpPublicKey, ethAddress: response.ethAddress };
}

export async function authenticateWithWebAuthn() {
    if (!provider) {
        throw new Error('Provider is not initialized.');
    }
    const authMethod = await provider.authenticate();
    const pkps = await provider.fetchPKPsThroughRelayer(authMethod);
    if (pkps.length === 0) {
        throw new Error('No PKP found for authenticated method.');
    }
    const pkpPublicKey = pkps[0].publicKey;
    const ethAddress = pkps[0].ethAddress;

    // Generate SessionSigs
    const sessionSigs = await provider.getSessionSigs({
        authMethod: authMethod,
        pkpPublicKey: pkpPublicKey,
        sessionSigsParams: {
            chain: 'ethereum',
            resourceAbilityRequests: [{
                resource: new LitActionResource("*"),
                ability: LitAbility.PKPSigning,
            }],
        },
    });

    return { pkpPublicKey, ethAddress, sessionSigs: JSON.stringify(sessionSigs) };
}