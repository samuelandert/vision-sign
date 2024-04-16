import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import fs from 'fs';
import path from 'path';

export default defineConfig({
	server: {
		https: {
			key: fs.readFileSync(path.resolve('localhost-key.pem'), 'utf-8'),
			cert: fs.readFileSync(path.resolve('localhost.pem'), 'utf-8')
		}
	},
	plugins: [sveltekit()],
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			},
			plugins: [
				NodeGlobalsPolyfillPlugin({
					buffer: true
				}),
				NodeModulesPolyfillPlugin()
			]
		}
	}
});