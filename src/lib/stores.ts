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

export const logMessages = writable([]);

export function log(message: string) {
    const error = new Error();
    const stackLine = error.stack?.split("\n")[2]; // Get the third line of the stack trace
    const origin = stackLine?.match(/(http.*):/)?.[1] || 'unknown'; // Extract URL

    const pathParts = origin.split('/'); // Split the path into parts
    const filename = pathParts.pop(); // Extracts only the filename from the path
    const folder = pathParts.pop(); // Extracts the last directory name in the path
    const cleanFilename = filename?.split('?')[0]; // Removes any query string from the filename
    const date = new Date().toLocaleTimeString('default', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }); // Gets the time part with milliseconds

    const entry = {
        message,
        date, // Now includes time with milliseconds
        origin: folder ? `${folder}/${cleanFilename}` : cleanFilename // Includes the folder and filename
    };
    logMessages.update(n => [...n, entry]);
}

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