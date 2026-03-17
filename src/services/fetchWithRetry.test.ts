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

  it('throws when max retries are exhausted', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable' });

    const config = createFetchConfig();
    const assertion = expect(fetchWithRetry(config)).rejects.toThrow('Failed to fetch data: Service Unavailable');

    for (let i = 1; i < SETTINGS.database_retry_attempts; i++) {
      await vi.advanceTimersByTimeAsync(SETTINGS.database_retry_delay);
    }

    await assertion;
  });

  it('shows loading dialog after slow_request_threshold ms for a slow request', async () => {
    let resolveFetch!: (value: Response) => void;
    const slowResponse = new Promise<Response>((resolve) => { resolveFetch = resolve; });
    global.fetch = vi.fn().mockReturnValueOnce(slowResponse);

    const config = createFetchConfig();
    const promise = fetchWithRetry(config);

    await vi.advanceTimersByTimeAsync(SETTINGS.slow_request_threshold);
    expect(config.setShowSpinUpDialog).toHaveBeenCalledWith(true);
    expect(config.setRetryCount).toHaveBeenCalledWith(0);

    resolveFetch({ ok: true, json: async () => ({ data: 'done' }) } as Response);
    await promise;
    expect(config.setShowSpinUpDialog).toHaveBeenCalledWith(false);
  });

  it('does not show loading dialog when request resolves before slow_request_threshold', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const config = createFetchConfig();
    await fetchWithRetry(config);

    expect(config.setShowSpinUpDialog).not.toHaveBeenCalledWith(true);
    expect(config.setShowSpinUpDialog).toHaveBeenCalledWith(false);
  });

  it('retries on failure and succeeds eventually', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
      .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
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