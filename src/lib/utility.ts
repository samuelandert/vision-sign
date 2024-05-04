import { meStore, authMethodSession } from './stores';
import { sendTxWithPKPWallet } from './sendTxWithPKPWallet';
import * as LitProtocol from '@lit-protocol/lit-node-client';
import { authenticate } from './authenticate';

export async function donateXDai() {
    try {
        await sendTxWithPKPWallet('0.01', '0xD2BEe43813d976104A3CE1251374AbE7a93A99d2');
        console.log('Transaction successful');
    } catch (error) {
        console.error('Transaction failed:', error);
    }
}

export async function sendCustomXDai() {
    const amount = prompt('Enter the amount of xDai to send:');
    const address = prompt("Enter the recipient's address:");
    if (amount && address) {
        try {
            await sendTxWithPKPWallet(amount, address);
            console.log('Custom transaction successful');
        } catch (error) {
            console.error('Custom transaction failed:', error);
        }
    }
}

export async function handleLogout() {
    try {
        await LitProtocol.disconnectWeb3();
        localStorage.removeItem('lit-session-key');
        authMethodSession.set(null);
        meStore.update((current) => ({ ...current, isLoggedIn: false }));
        console.log('Logged out successfully');
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

export async function handleLogin() {
    try {
        await authenticate();
    } catch (error) {
        console.error('Login failed:', error);
    }
}

export function refreshPage() {
    window.location.reload();
}