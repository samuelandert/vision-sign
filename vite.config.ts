import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Check if the current environment is development
const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig({
	server: {
		...(isDevelopment && {
			https: {
				key: fs.readFileSync(path.resolve('localhost-key.pem'), 'utf-8'),
				cert: fs.readFileSync(path.resolve('localhost.pem'), 'utf-8')
			}
		})
	},
	plugins: [
		sveltekit(),
		nodePolyfills({
			include: ['path', 'stream', 'util'],
			exclude: ['http'],
			globals: {
				Buffer: true,
				global: true,
				process: true,
			},
			overrides: {
				fs: 'memfs',
			},
			protocolImports: true,
		}),
	],
});