import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Force client-side environment for Svelte 5
globalThis.window = globalThis.window || {};
globalThis.document = globalThis.document || {};
globalThis.navigator = globalThis.navigator || {};

// Ensure we're not in SSR mode
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Mock Firebase - needs to be available globally
vi.mock('$lib/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      if (callback) callback({ uid: 'test-user-123' });
      return vi.fn(); // unsubscribe function
    }),
    signOut: vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock environment variables
vi.mock('$env/static/public', () => ({
  PUBLIC_BACKEND_API_URL: 'http://localhost:3001'
}));

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false,
  version: '1.0.0'
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidateAll: vi.fn()
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock window.confirm and window.alert
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true)
});

Object.defineProperty(window, 'alert', {
  writable: true,
  value: vi.fn()
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock lucide-svelte to avoid Svelte 5 compatibility issues  
vi.mock('lucide-svelte', () => {
  // Create a mock component that works with the testing library
  const MockIcon = vi.fn(() => null);
  return new Proxy({}, {
    get: () => MockIcon
  });
});

// Remove UI component mocks - let real components render
// This should fix the timeout issues

// Mock Icon component from @iconify/svelte
vi.mock('@iconify/svelte', () => ({
  default: (props: any) => `<svg class="icon ${props?.class || ''}" data-icon="${props?.icon || ''}"></svg>`
}));

// Mock separator component
vi.mock('$lib/components/ui/separator', () => ({
  Separator: (props: any) => `<div class="separator ${props?.class || ''}" role="separator"></div>`
})); 