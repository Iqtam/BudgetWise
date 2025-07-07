import '@testing-library/jest-dom';
import { vi } from 'vitest';

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

// Mock UI components that might have compatibility issues
vi.mock('$lib/components/ui/button', () => ({
  Button: vi.fn(() => null)
}));

vi.mock('$lib/components/ui/card', () => ({
  Card: vi.fn(() => null),
  CardContent: vi.fn(() => null),
  CardHeader: vi.fn(() => null),
  CardTitle: vi.fn(() => null)
}));

vi.mock('$lib/components/ui/input', () => ({
  Input: vi.fn(() => null)
}));

vi.mock('$lib/components/ui/label', () => ({
  Label: vi.fn(() => null)
}));

vi.mock('$lib/components/ui/select', () => ({
  Select: vi.fn(() => null),
  SelectContent: vi.fn(() => null),
  SelectItem: vi.fn(() => null),
  SelectTrigger: vi.fn(() => null)
}));

vi.mock('$lib/components/ui/dialog', () => ({
  Dialog: vi.fn(() => null),
  DialogContent: vi.fn(() => null),
  DialogHeader: vi.fn(() => null),
  DialogTitle: vi.fn(() => null)
}));

vi.mock('$lib/components/ui/badge', () => ({
  Badge: vi.fn(() => null)
}));

vi.mock('$lib/components/ui/progress', () => ({
  Progress: vi.fn(() => null)
})); 