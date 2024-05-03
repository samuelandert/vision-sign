<script>
	import { onMount } from 'svelte';
	import { meStore, authMethodSession } from '$lib/stores';
	import { initializeAuthentication } from '$lib/authenticate';
	import * as LitProtocol from '@lit-protocol/lit-node-client';

	let authMethod;

	onMount(async () => {
		try {
			await initializeAuthentication();
		} catch (error) {
			console.error('Authentication initialization failed:', error);
		}
		authMethodSession.subscribe((value) => {
			authMethod = value;
		});
	});

	async function handleLogout() {
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
	async function handleLogin() {
		try {
			await initializeAuthentication();
		} catch (error) {
			console.error('Login failed:', error);
		}
	}
</script>

{#if $meStore.isLoggedIn && authMethod}
	<p>{$meStore.ethAddress}</p>
	<button
		on:click={handleLogout}
		class="px-4 py-2 font-bold text-white transition duration-300 ease-in-out bg-orange-500 rounded-xl hover:bg-orange-600"
		>Logout</button
	>
{:else if $meStore.isLoggedIn && !authMethod}
	<p>Authenticating...</p>
{:else if !$meStore.isLoggedIn}
	<button
		on:click={handleLogin}
		class="px-4 py-2 font-bold text-white transition duration-300 ease-in-out bg-blue-500 rounded hover:bg-blue-700"
		>Login</button
	>
{:else if !$meStore}
	<p>Invite only..., please get an invite link</p>
{/if}
