import { writable, get } from 'svelte/store';
import { persist, createCookieStorage } from "@macfja/svelte-persistent-store";
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { initializeLitClients } from './appInit';

interface MeObject {
    pkpPubKey: string;
    ethAddress: string;
}

export const pkpWalletStore = writable<PKPEthersWallet | null>(null);
const meStoreInitial = writable<MeObject>({ pkpPubKey: '', ethAddress: '' });
export const meStore = persist(meStoreInitial, createCookieStorage(), "me");
export const litNodeClientStore = writable<LitNodeClient | null>(null);
export const litProviderStore = writable<any | null>(null);
export const connectionStatusStore = writable<string>('Disconnected');

// Ensure Lit clients are initialized before proceeding with any operation
export async function ensureLitClientsAreInitialized() {
    const litNodeClient = get(litNodeClientStore);
    const litProvider = get(litProviderStore);
    if (!litNodeClient || !litProvider) {
        await initializeLitClients();
    }
}
// Define a store for authSig
export const authSigStore = writable<Function | null>(null);