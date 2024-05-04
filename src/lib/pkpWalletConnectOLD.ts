// onMount(async () => {
// pkpWalletConnect = await initPKPWalletConnect();
// const signClient = pkpWalletConnect.getSignClient();
// const walletSig = localStorage.getItem('lit-wallet-sig');
// if (walletSig) {
// 	const walletData = JSON.parse(walletSig);
// 	userAddress = walletData.address;
// }
// let address = pkpWalletConnect?.getAccounts();
// console.log('accounts', address);
// pkpWalletConnect.on('session_proposal', async (proposal) => {
// 	console.log('Received session proposal: ', proposal);
// 	// Extracting chain IDs from the proposal
// 	const chains = proposal.params.optionalNamespaces?.eip155?.chains || [];
// 	console.log('Proposed Chains:', chains);
// 	if (chains.includes('eip155:1')) {
// 		// Check for Ethereum Mainnet
// 		console.log('Ethereum Mainnet is included in the proposal, approving session...');
// 		// Use SignClient to approve the session proposal
// 		await signClient.approve({
// 			id: proposal.id,
// 			relayProtocol: proposal.relayProtocol,
// 			namespaces: {
// 				eip155: {
// 					accounts: [`eip155:1:${userAddress}`],
// 					methods: proposal.params.optionalNamespaces.eip155.methods,
// 					events: proposal.params.optionalNamespaces.eip155.events,
// 					chains: ['eip155:1']
// 				}
// 			}
// 		});
// 		console.log('Session approved for Ethereum Mainnet');
// 	} else {
// 		console.log('Ethereum Mainnet is not supported in this proposal, rejecting session...');
// 		await signClient.reject({
// 			id: proposal.id,
// 			reason: 'Unsupported chain'
// 		});
// 	}
// 	// Log active sessions
// 	const sessions = Object.values(pkpWalletConnect.getActiveSessions());
// 	for (const session of sessions) {
// 		const { name, url } = session.peer.metadata;
// 		console.log(`Active Session: ${name} (${url})`);
// 	}
// });
// pkpWalletConnect.on('session_request', async (requestEvent) => {
// 	console.log('Received session request: ', requestEvent);
// 	const { topic, params } = requestEvent;
// 	const { request } = params;
// 	const signClient = pkpWalletConnect.getSignClient(); // Retrieve the SignClient instance
// 	const requestSession = signClient.session.get(topic);
// 	const { name, url } = requestSession.peer.metadata;
// 	const userConfirm = confirm(
// 		`Approve ${request.method} request for session ${name} (${url})?`
// 	);
// 	if (userConfirm) {
// 		await pkpWalletConnect.approveSessionRequest(requestEvent);
// 		console.log(`Request approved for ${name}`);
// 	} else {
// 		console.log(`Request denied for ${name}`);
// 	}
// });
// });

// async function connectPKPWallet() {
// 	const uri = prompt('Please enter the URI to connect:');
// 	if (uri) {
// 		await pkpWalletConnect.pair({ uri });
// 	}
// }