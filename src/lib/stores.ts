import { writable, get } from 'svelte/store';
import { persist, createCookieStorage } from "@macfja/svelte-persistent-store";
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { initializeLitClients } from './appInit';
import { authenticateWithWebAuthn } from './webAuthn';

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
export const authMethodStore = writable<any | null>(null);

export async function ensureLitClientsAreInitialized() {
    const litNodeClient = get(litNodeClientStore);
    const litProvider = get(litProviderStore);
    if (!litNodeClient || !litProvider) {
        await initializeLitClients();
    }
}

export async function ensureAuthMethodAvailable() {
    const authMethod = get(authMethodStore);
    if (!authMethod) {
        await authenticateWithWebAuthn();
    }
}