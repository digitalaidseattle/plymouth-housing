import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Default global fetch mock to avoid network calls in tests.
const defaultFetch = async (url: string, options?: any) => {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({}),
  } as Response;
};

globalThis.fetch = vi
  .fn()
  .mockImplementation(defaultFetch) as unknown as typeof fetch;

// Minimal matchMedia mock for components that rely on it (MUI/etc.)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
