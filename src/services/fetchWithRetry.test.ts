import { fetchWithRetry } from './fetchWithRetry';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Dummy user with the required volunteer role
const dummyUser = {
  userID: '1',
  userDetails: 'Test User',
  userRoles: ['volunteer'],
  claims: [],
};

// Helper to create a FetchConfig object
const createFetchConfig = (overrides = {}) => ({
  url: 'https://example.com',
  options: {},
  user: dummyUser,
  role: 'volunteer', 
  setShowSpinUpDialog: vi.fn(),
  setRetryCount: vi.fn(),
  ...overrides,
});

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Reset mocks before each test
    vi.useFakeTimers(); // Enable fake timers for retry simulation
  });

  afterEach(() => {
    vi.runAllTimers(); // Run all pending timers
    vi.useRealTimers(); // Restore real timers
  });

  it('succeeds on the first attempt', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ data: 'success' }),
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

    const config = createFetchConfig();
    const response = await fetchWithRetry(config);
    expect(response).toEqual({ data: 'success' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

});