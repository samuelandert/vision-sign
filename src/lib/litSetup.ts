import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { pkpWalletStore, meStore } from '$lib/stores';
import { PKPClient } from "@lit-protocol/pkp-client";
import { PKPWalletConnect } from "@lit-protocol/pkp-walletconnect";

const litAuthClient = new LitAuthClient({
    litRelayConfig: {
        relayApiKey: 'test-api-key',
    },
});

const walletConnectConfig = {
    projectId: "0f53c89a9e444fed11155af787ce0f40",
    metadata: {
        name: "Hominio",
        description: "Hominio Wallet",
        url: "https://visioncreator.works",
        icons: ["/favicon.png"],
    },
};

let provider;
let litNodeClient;
let authSig;

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
    // Update meStore directly
    meStore.set({ pkpPubKey: response.pkpPublicKey, ethAddress: response.ethAddress });
}

import { wcClientStore } from './stores'; // Import the store



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

    authSig = async (params: AuthCallbackParams) => {
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
                authNeededCallback: authSig
            },
        },
        pkpPubKey: pkpPublicKey,
        rpc: "https://rpc.gnosischain.com",
    });

    await pkpWallet.init();
    console.log("pkpWallet init successful");

    pkpWalletStore.set(pkpWallet);
    meStore.set({ pkpPubKey: pkpPublicKey, ethAddress: ethAddress });

    const pkpClient = new PKPClient({
        authContext: {
            client: litNodeClient,
            getSessionSigsProps: {
                chain: 'ethereum',
                expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
                resourceAbilityRequests: resourceAbilities,
                authNeededCallback: authSig
            },
        },
        pkpPubKey: pkpPublicKey,
    });
    await pkpClient.connect();
    console.log("pkpClient init successful");

    const wcClient = new PKPWalletConnect();
    await wcClient.initWalletConnect(walletConnectConfig);
    wcClient.addPKPClient(pkpClient);

    console.log("wsclient connected")

    wcClientStore.set(wcClient);

}
