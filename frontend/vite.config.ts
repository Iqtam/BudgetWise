import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit(), devtoolsJson()],
  server: {
    watch: {
      usePolling: true
    },
    host: '0.0.0.0',
    port: 3000
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.svelte-kit', 'build']
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
    }
  }
});
