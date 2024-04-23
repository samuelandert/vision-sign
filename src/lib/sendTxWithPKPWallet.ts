import { ethers } from 'ethers';
import { pkpWalletStore } from './stores';
import { authenticateWithWebAuthn } from './litSetup';

export async function sendTxWithPKPWallet() {
    let pkpWallet;

    // Subscribe to pkpWalletStore to check if the wallet is set
    const unsubscribe = pkpWalletStore.subscribe($pkpWalletStore => {
        pkpWallet = $pkpWalletStore;
    });
    unsubscribe(); // Immediately unsubscribe as we only need the current value

    if (!pkpWallet) {
        console.log('PKP Wallet not set, authenticating...');
        await authenticateWithWebAuthn();
        // Re-subscribe to get the newly set wallet
        const unsubscribeAgain = pkpWalletStore.subscribe($pkpWalletStore => {
            pkpWallet = $pkpWalletStore;
        });
        unsubscribeAgain(); // Clean up the subscription
        if (!pkpWallet) {
            throw new Error('Failed to set up PKP Wallet.');
        }
    }

    // Proceed with the transaction using pkpWallet
    const value = ethers.parseUnits("0.01", "ether"); // 0.01 xDai
    const tx = {
        to: '0x1A5cfC9EA11afb50011F847fb7dC07bA1e18b05A',
        value,
        gasLimit: 21000, // Standard gas limit for a simple transfer
    };

    console.log('Transaction created:', tx);
    const signedTx = await pkpWallet.signTransaction(tx);
    console.log('Transaction signed:', signedTx);

    const txResponse = await pkpWallet.sendTransaction(signedTx);
    console.log('Transaction sent:', txResponse.hash);
}