// const value = BigInt(100000000000000000)
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';

export async function sendTxWithPKPWallet(pkpWallet: PKPEthersWallet) {
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