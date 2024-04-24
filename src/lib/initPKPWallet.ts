import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { pkpWalletStore, litNodeClientStore, ensureLitClientsAreInitialized, authMethodStore, ensureAuthMethodAvailable } from './stores';

const resourceAbilities = [
    {
        resource: "*",
        ability: "PKPSigning",
    },
];

export async function initPKPWallet() {
    await ensureAuthMethodAvailable();

    let litNodeClient;
    litNodeClientStore.subscribe(value => { litNodeClient = value; });

    let authSig = async (params) => {
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
                authNeededCallback: authSig,
            },
        },
        rpc: "https://rpc.gnosischain.com",
    });

    await pkpWallet.init();
    console.log("PKP Wallet initialized successfully");
    pkpWalletStore.set(pkpWallet);
}