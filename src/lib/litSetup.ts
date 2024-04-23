import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { pkpWalletStore } from '$lib/stores';

const litAuthClient = new LitAuthClient({
    litRelayConfig: {
        relayApiKey: 'test-api-key',
    },
});

let provider;
let litNodeClient;

const resourceAbilities = [
    {
        resource: new LitActionResource("*"),
        ability: LitAbility.PKPSigning,
    },
];

export async function connectProvider() {
    litNodeClient = new LitNodeClient({
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

    const authNeededCallback = async (params: AuthCallbackParams) => {
        const response = await litNodeClient.signSessionKey({
            statement: params.statement,
            authMethods: [authMethod],
            expiration: params.expiration,
            resources: params.resources,
            chainId: 100
        });
        return response.authSig;
    };

    const pkpWallet = new PKPEthersWallet({
        authContext: {
            client: litNodeClient,
            getSessionSigsProps: {
                chain: 'xdai',
                expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
                resourceAbilityRequests: resourceAbilities,
                authNeededCallback,
            },
        },
        pkpPubKey: pkpPublicKey,
        rpc: "https://rpc.gnosischain.com",
    });

    await pkpWallet.init();
    console.log("pkp init succesfull ", pkpWallet)

    pkpWalletStore.set(pkpWallet);

    return { pkpPublicKey, ethAddress };
}

