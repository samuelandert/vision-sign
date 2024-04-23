import { writable } from 'svelte/store';
import { persist, createCookieStorage } from "@macfja/svelte-persistent-store";
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';

// Existing PKP Wallet Store
export const pkpWalletStore = writable<PKPEthersWallet | null>(null);

// Define a type for the 'me' object
interface MeObject {
    pkpPubKey: string;
    ethAddress: string;
    authSig?: string;
}

// Create a writable store for the 'me' object with an initial value of an empty object
const meStoreInitial = writable<MeObject>({ pkpPubKey: '', ethAddress: '' });

// Persist the 'meStore' to a cookie
export const meStore = persist(meStoreInitial, createCookieStorage(), "me");

export const authSigStore = writable<string | null>(null);