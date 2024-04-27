import { PKPClient } from "@lit-protocol/pkp-client";
import { litNodeClientStore, authMethodStore, ensureAuthMethodAvailable, meStore } from './stores';
import { PKPWalletConnect } from "@lit-protocol/pkp-walletconnect";
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';

const resourceAbilities = [
    {
        resource: new LitActionResource("*"),
        ability: LitAbility.PKPSigning,
    },
];

const config = {
    projectId: "0f53c89a9e444fed11155af787ce0f40",
    metadata: {
        name: "Hominio",
        description: "My Wallet",
        url: "https://localhost:5173",
    },
};

export async function initPKPWalletConnect() {
    await ensureAuthMethodAvailable();

    let litNodeClient;
    litNodeClientStore.subscribe(value => { litNodeClient = value; });

    let currentAuthMethod;
    authMethodStore.subscribe(value => { currentAuthMethod = value; });

    let pkpPubKey;
    meStore.subscribe($me => { pkpPubKey = $me.pkpPubKey; });

    if (!pkpPubKey) {
        console.error("PKP public key is missing.");
        return;
    }

    const authNeededCallback = async (params: AuthCallbackParams) => {
        const response = await litNodeClient.signSessionKey({
            statement: params.statement,
            authMethods: [currentAuthMethod],
            expiration: params.expiration,
            resources: params.resources,
            chainId: 1,
        });
        return response.authSig;
    };

    const pkpClient = new PKPClient({
        authContext: {
            client: litNodeClient,
            getSessionSigsProps: {
                chain: '1',
                expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
                resourceAbilityRequests: resourceAbilities,
                authNeededCallback
            },
        },
        rpc: "https://rpc.gnosischain.com",
        pkpPubKey: pkpPubKey,
    });

    await pkpClient.connect();
    console.log("PKPClient connected");

    const pkpWalletConnect = new PKPWalletConnect();
    await pkpWalletConnect.initWalletConnect(config);
    pkpWalletConnect.addPKPClient(pkpClient);
    console.log("PKPWalletConnect initialized and PKPClient added");

    return pkpWalletConnect;
}