import { ensureLitClientsAreInitialized, litProviderStore, meStore, log } from '$lib/stores';
import { goto } from '$app/navigation';

export async function registerWithWebAuthn(namedPasskey: string) {
    await ensureLitClientsAreInitialized();
    let provider;
    litProviderStore.subscribe(value => { provider = value; });

    try {
        if (!provider) {
            throw new Error('Provider is not initialized.');
        }
        const options = await provider.register(namedPasskey);
        const txHash = await provider.verifyAndMintPKPThroughRelayer(options);
        const response = await provider.relay.pollRequestUntilTerminalState(txHash);
        meStore.set({ pkpPubKey: response.pkpPublicKey, pkpTokenId: response.pkpTokenId });

        log(`Public Key: ${response.pkpPublicKey}`);

        goto('/');
    } catch (error) {
        log(`Error: ${error.message}`);
        throw error;
    }
}