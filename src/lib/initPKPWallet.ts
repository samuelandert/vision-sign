import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { pkpWalletStore, litNodeClientStore, authMethodStore, ensureAuthMethodAvailable } from './stores';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';

const resourceAbilities = [
    {
        resource: new LitActionResource("*"),
        ability: LitAbility.PKPSigning,
    },
];

export async function initPKPWallet() {
    await ensureAuthMethodAvailable();
    // const sessionKeyPair = litNodeClient.getSessionKey();

    let litNodeClient;
    litNodeClientStore.subscribe(value => { litNodeClient = value; });

    let authNeededCallback = async (params) => {
        let currentAuthMethod;
        authMethodStore.subscribe(value => { currentAuthMethod = value; });
        const response = await litNodeClient.signSessionKey({

            statement: params.statement,
            authMethods: [currentAuthMethod],
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
        rpc: "https://rpc.gnosischain.com",
    });

    await pkpWallet.init();
    console.log("PKP Wallet initialized successfully");
    pkpWalletStore.set(pkpWallet);
}