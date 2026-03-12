import { fetchWithRetry } from './fetchWithRetry';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SETTINGS } from '../types/constants';

const createFetchConfig = (overrides = {}) => ({
  url: 'https://example.com',
  role: 'volunteer',
  setShowSpinUpDialog: vi.fn(),
  setRetryCount: vi.fn(),
  ...overrides,
});

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
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

  it('hides the spin-up dialog and passes role header on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const config = createFetchConfig({ role: 'admin' });

    await fetchWithRetry(config);

    expect(config.setShowSpinUpDialog).toHaveBeenCalledWith(false);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-MS-API-ROLE': 'admin' }),
      }),
    );
  });

  it('throws immediately when max retries are exhausted', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Service Unavailable' });

    const config = createFetchConfig();
    const promise = fetchWithRetry(config, SETTINGS.database_retry_attempts);

    await expect(promise).rejects.toThrow('Failed to fetch data: Service Unavailable');
  });

  it('retries on failure and succeeds eventually', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, statusText: 'Service Unavailable' })
      .mockResolvedValueOnce({ ok: false, statusText: 'Service Unavailable' })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'success' }) });

    const config = createFetchConfig();
    const promise = fetchWithRetry(config); // starts at attempt 1 by default

    // advance past each retry's setTimeout to unblock the next attempt
    await vi.advanceTimersByTimeAsync(SETTINGS.database_retry_delay);
    await vi.advanceTimersByTimeAsync(SETTINGS.database_retry_delay);

    const response = await promise;

    expect(response).toEqual({ data: 'success' });
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(config.setShowSpinUpDialog).toHaveBeenCalledWith(true);
    expect(config.setRetryCount).toHaveBeenCalledWith(1);
    expect(config.setRetryCount).toHaveBeenCalledWith(2);
  });
});