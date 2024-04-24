import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers'; import { pkpWalletStore, meStore, litNodeClientStore, litProviderStore, ensureLitClientsAreInitialized, authSigStore } from '$lib/stores';

import { get } from 'svelte/store';

const resourceAbilities = [
    {
        resource: new LitActionResource("*"),
        ability: LitAbility.PKPSigning,
    },
];

export async function registerWithWebAuthn(namedPasskey: string) {
    await ensureLitClientsAreInitialized();
    let provider;
    litProviderStore.subscribe(value => { provider = value; });

    if (!provider) {
        throw new Error('Provider is not initialized.');
    }
    const options = await provider.register(namedPasskey);
    const txHash = await provider.verifyAndMintPKPThroughRelayer(options);
    const response = await provider.relay.pollRequestUntilTerminalState(txHash);
    meStore.set({ pkpPubKey: response.pkpPublicKey, ethAddress: response.ethAddress });
}

export async function authenticateWithWebAuthn() {
    await ensureLitClientsAreInitialized();
    let provider, litNodeClient;
    litProviderStore.subscribe(value => { provider = value; });
    litNodeClientStore.subscribe(value => { litNodeClient = value; });

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

    authSigStore.set(async (params: AuthCallbackParams) => {
        const response = await litNodeClient.signSessionKey({
            statement: params.statement,
            authMethods: [authMethod],
            expiration: params.expiration,
            resources: params.resources,
            chainId: 100
        });
        return response.authSig;
    });
    const pkpWallet = new PKPEthersWallet({
        authContext: {
            client: litNodeClient,
            getSessionSigsProps: {
                chain: 'xdai',
                expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
                resourceAbilityRequests: resourceAbilities,
                authNeededCallback: async (params) => {
                    // Use get to access the current value of authSigStore
                    const authSig = get(authSigStore);
                    if (typeof authSig === 'function') {
                        return authSig(params);
                    } else {
                        throw new Error('authSig is not a function');
                    }
                }
            },
        },
        pkpPubKey: pkpPublicKey,
        rpc: "https://rpc.gnosischain.com",
    });

    await pkpWallet.init();
    console.log("pkpWallet init successful");

    pkpWalletStore.set(pkpWallet);
    meStore.set({ pkpPubKey: pkpPublicKey, ethAddress: ethAddress });
}