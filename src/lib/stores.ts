import { writable } from 'svelte/store';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';

// Create a writable store with an initial value of null
export const pkpWalletStore = writable<PKPEthersWallet | null>(null);