import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// Adjusted import statements assuming named exports
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis'
			},
			// Enable Node.js global polyfills in development mode
			plugins: [
				NodeGlobalsPolyfillPlugin({
					buffer: true
				}),
				NodeModulesPolyfillPlugin()
			]
		}
	}
});