import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), devtoolsJson()],
	server: {
		watch: {
			usePolling: true
		},
		host: '0.0.0.0', // Allow external connections
		port: 3000 // Use port 3000 instead of 5173
	}
});
