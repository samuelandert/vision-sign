import { ethers } from 'ethers';
import { pkpWalletStore } from './stores';

export async function sendTxWithPKPWallet(amount: string, address: string) {
    let pkpWallet;

    pkpWalletStore.subscribe($pkpWalletStore => {
        pkpWallet = $pkpWalletStore;
    });

    // Proceed with the transaction using pkpWallet
    const value = ethers.parseUnits(amount, "ether");
    const tx = {
        chainId: 100,
        to: address,
        value,
        gasLimit: 21000,
    };

    console.log('Transaction created:', tx);
    const signedTx = await pkpWallet.signTransaction(tx);
    console.log('Transaction signed:', signedTx);

    const txResponse = await pkpWallet.sendTransaction(signedTx);
    console.log('Transaction sent:', txResponse.hash);
}