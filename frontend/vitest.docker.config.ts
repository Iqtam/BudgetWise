import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      hot: !process.env.VITEST,
      compilerOptions: {
        // Disable runes mode for better compatibility with dependencies
        runes: false
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setupTests.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.svelte-kit', 'build'],
    pool: 'forks', // Use forks instead of threads for better isolation
    poolOptions: {
      forks: {
        singleFork: true
      }
    }
  },
  esbuild: {
    target: 'node14'
  },
  resolve: {
    alias: {
      '$lib': '/app/src/lib'
    }
  }
}); 