import { writable } from 'svelte/store';
import { persist, createCookieStorage } from "@macfja/svelte-persistent-store";
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPWalletConnect } from "@lit-protocol/pkp-walletconnect";


// Existing PKP Wallet Store
export const pkpWalletStore = writable<PKPEthersWallet | null>(null);

// Define a type for the 'me' object
interface MeObject {
    pkpPubKey: string;
    ethAddress: string;
}

// Create a writable store for the 'me' object with an initial value of an empty object
const meStoreInitial = writable<MeObject>({ pkpPubKey: '', ethAddress: '' });

// Persist the 'meStore' to a cookie
export const meStore = persist(meStoreInitial, createCookieStorage(), "me");


// Initialize wcClient store with a null value
export const wcClientStore = writable<PKPWalletConnect | null>(null);