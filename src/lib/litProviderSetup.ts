// src/lib/litProviderSetup.ts

import { LitNodeClient } from '@lit-protocol/lit-node-client';

export async function connectLitNodeClient() {
    const litNodeClient = new LitNodeClient({
        litNetwork: 'manzano', // Specify the network you want to connect to
        debug: true
    });
    try {
        await litNodeClient.connect();
        // If the connection is successful, return true
        return true;
    } catch (error) {
        console.error("Failed to connect to LitNodeClient:", error);
        // If there's an error (i.e., connection unsuccessful), return false
        return false;
    }
}