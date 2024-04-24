import { PKPClient } from "@lit-protocol/pkp-client";
import { litNodeClientStore, authMethodStore, ensureAuthMethodAvailable, meStore } from './stores';
import { PKPWalletConnect } from "@lit-protocol/pkp-walletconnect";

const resourceAbilities = [
    {
        resource: "*",
        ability: "PKPSigning",
    },
];
const config = {
    projectId: "0f53c89a9e444fed11155af787ce0f40",
    metadata: {
        name: "Homin.io",
        description: "My Wallet",
        url: "https://localhost:5173",
        icons: ["/favicon.png"],
    },
};

export async function initPKPWalletConnect() {
    await ensureAuthMethodAvailable();

    let litNodeClient;
    litNodeClientStore.subscribe(value => { litNodeClient = value; });

    let currentAuthMethod;
    authMethodStore.subscribe(value => { currentAuthMethod = value; });

    // Retrieve pkpPubKey from meStore
    let pkpPubKey;
    meStore.subscribe($me => { pkpPubKey = $me.pkpPubKey; });

    if (!pkpPubKey) {
        console.error("PKP public key is missing.");
        return;
    }

    let authNeededCallback = async (params) => {
        const response = await litNodeClient.signSessionKey({
            statement: params.statement,
            authMethods: [currentAuthMethod],
            expiration: params.expiration,
            resources: params.resources,
            chainId: 100
        });
        return response.authSig;
    };

    // Ensure only one instance of PKPClient is created
    const pkpClient = new PKPClient({
        authContext: {
            client: litNodeClient,
            getSessionSigsProps: {
                chain: 'xdai', // or 'ethereum', adjust according to your needs
                expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
                resourceAbilityRequests: resourceAbilities,
                authNeededCallback,
            },
        },
        rpc: "https://rpc.gnosischain.com",
        pkpPubKey: pkpPubKey, // Use the pkpPubKey from meStore
    });

    await pkpClient.connect();
    console.log("PKPClient connected");

    const pkpWalletConnect = new PKPWalletConnect();
    await pkpWalletConnect.initWalletConnect(config);
    pkpWalletConnect.addPKPClient(pkpClient);

}