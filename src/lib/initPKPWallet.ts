import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { pkpWalletStore, litNodeClientStore, authMethodSession, meStore, log } from './stores';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { get } from 'svelte/store';

const resourceAbilities = [
    {
        resource: new LitActionResource("*"),
        ability: LitAbility.PKPSigning,
    },
];

export async function initPKPWallet() {
    log('Starting PKP Wallet initialization...');

    const me = get(meStore)
    const authMethod = get(authMethodSession);

    if (!authMethod) {
        throw new Error("Authentication method is not set");
    }
    const litNodeClient = get(litNodeClientStore);

    if (!litNodeClient) {
        throw new Error("LitNodeClient is not initialized");
    }
    // const nonce = litNodeClient.getLatestBlockhash();

    // let authNeededCallback = async (params) => {
    //     console.log("authNeededCallback params:", params);
    //     try {
    //         const response = await litNodeClient.signSessionKey({
    //             authMethods: [authMethod],
    //             expiration: params.expiration,
    //             nonce,
    //             chainId: 100
    //         });
    //         console.log('Session key signed successfully:', response.authSig);
    //         return response.authSig;
    //     } catch (error) {
    //         console.error('Error in authNeededCallback:', error);
    //         throw error;
    //     }
    // };

    // const pkpWallet = new PKPEthersWallet({
    //     authContext: {
    //         authMethods: [authMethod],
    //         client: litNodeClient,
    //         getSessionSigsProps: {
    //             chain: 'xdai',
    //             expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
    //             resourceAbilityRequests: resourceAbilities,
    //             authNeededCallback,
    //         },
    //     },
    //     pkpPubKey: me.pkpPubKey,
    // });

    // try {
    //     await pkpWallet.init();
    //     log("PKP Wallet initialized successfully.");
    //     pkpWalletStore.set(pkpWallet);
    // } catch (error) {
    //     log(`Failed to initialize PKP Wallet: ${error.message}`);
    //     throw error;
    // }
}