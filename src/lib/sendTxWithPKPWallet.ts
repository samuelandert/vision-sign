import { ethers } from 'ethers';
import { pkpWalletStore } from './stores';
import { authenticateWithWebAuthn } from './webAuthn';

export async function sendTxWithPKPWallet() {

    let pkpWallet;

    // Subscribe to pkpWalletStore to check if the wallet is set
    const unsubscribe = pkpWalletStore.subscribe($pkpWalletStore => {
        pkpWallet = $pkpWalletStore;
    });
    unsubscribe();

    if (!pkpWallet) {
        console.log('PKP Wallet not set, authenticating...');
        await authenticateWithWebAuthn();
        // Re-subscribe to get the newly set wallet
        const unsubscribeAgain = pkpWalletStore.subscribe($pkpWalletStore => {
            pkpWallet = $pkpWalletStore;
        });
        unsubscribeAgain();
        if (!pkpWallet) {
            throw new Error('Failed to set up PKP Wallet.');
        }
    }

    // Proceed with the transaction using pkpWallet
    const value = ethers.parseUnits("0.01", "ether"); // 0.01 xDai
    const tx = {
        to: '0xD2BEe43813d976104A3CE1251374AbE7a93A99d2',
        value,
        gasLimit: 21000,
    };

    console.log('Transaction created:', tx);
    const signedTx = await pkpWallet.signTransaction(tx);
    console.log('Transaction signed:', signedTx);

    const txResponse = await pkpWallet.sendTransaction(signedTx);
    console.log('Transaction sent:', txResponse.hash);
}