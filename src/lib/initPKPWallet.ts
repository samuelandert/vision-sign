import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { pkpWalletStore, litNodeClientStore, authMethodSession, meStore, log } from './stores';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';

const resourceAbilities = [
    {
        resource: new LitActionResource("*"),
        ability: LitAbility.PKPSigning,
    },
];

export async function initPKPWallet() {
    log('Starting PKP Wallet initialization...');

    let me;
    meStore.subscribe(value => {
        me = value;
        log(`User data loaded: ${JSON.stringify(me)}`);
    });

    let litNodeClient;
    litNodeClientStore.subscribe(value => {
        litNodeClient = value;
        log('LitNode client loaded.');
    });

    if (!litNodeClient) {
        log('Error: LitNode client is not available.');
        throw new Error('LitNode client is not available.');
    }

    const sessionKeyPair = litNodeClient.getSessionKey();
    if (!sessionKeyPair) {
        log('Error: Session key pair is missing.');
        throw new Error('Session key pair is missing.');
    }

    let authNeededCallback = async (params) => {
        let currentAuthMethod;
        authMethodSession.subscribe(value => {
            currentAuthMethod = value;
            log(`Current authentication method: ${currentAuthMethod}`);
        });

        log(`Signing session key with statement: ${params.statement}`);
        const response = await litNodeClient.signSessionKey({
            sessionKey: sessionKeyPair,
            statement: params.statement,
            authMethods: [currentAuthMethod],
            expiration: params.expiration,
            resources: params.resources,
            chainId: 100
        });
        log('Session key signed successfully.');
        return response.authSig;
    };

    if (!me || !me.pkpPubKey) {
        log('Error: User public key is missing.');
        throw new Error('User public key is missing.');
    }

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
        pkpPubKey: me.pkpPubKey,
        rpc: "https://rpc.gnosischain.com",
    });

    try {
        await pkpWallet.init();
        log("PKP Wallet initialized successfully.");
        pkpWalletStore.set(pkpWallet);
    } catch (error) {
        log(`Failed to initialize PKP Wallet: ${error.message}`);
        throw error;
    }
}