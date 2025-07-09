import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setupTests.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.svelte-kit', 'build']
  },
  resolve: {
    alias: {
          '$lib': path.resolve('./src/lib'),
          '$app': path.resolve('./src/app')
    },
    conditions: ['browser', 'default']
  }
}); 