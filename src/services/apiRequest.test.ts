import { apiRequest, setSpinUpCallbacks } from './apiRequest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SETTINGS } from '../types/constants';

const createApiConfig = (overrides = {}) => ({
  url: 'https://example.com',
  role: 'volunteer',
  ...overrides,
});

describe('apiRequest', () => {
  let mockSetShowSpinUpDialog: (show: boolean) => void;
  let mockSetRetryCount: (count: number) => void;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();

    // Set up global callbacks
    mockSetShowSpinUpDialog = vi.fn();
    mockSetRetryCount = vi.fn();
    setSpinUpCallbacks(mockSetShowSpinUpDialog, mockSetRetryCount);
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('succeeds on the first attempt', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ value: { data: 'success' } }),
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

    const config = createApiConfig();
    const response = await apiRequest(config);
    expect(response).toEqual({ value: { data: 'success' } });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('hides the spin-up dialog and passes role header on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: {} }),
    });
    const config = createApiConfig({ role: 'admin' });

    await apiRequest(config);

    expect(mockSetShowSpinUpDialog).toHaveBeenCalledWith(false);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-MS-API-ROLE': 'admin' }),
      }),
    );
  });

  it('throws when max retries are exhausted', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable' });
    global.fetch = fetchMock;

    const config = createApiConfig();
    const assertion = expect(apiRequest(config)).rejects.toThrow('Failed to fetch data: Service Unavailable');

    // Advance timers through all retry delays (first attempt doesn't need a delay)
    for (let i = 1; i < SETTINGS.database_retry_attempts; i++) {
      await vi.advanceTimersByTimeAsync(SETTINGS.database_retry_delay);
    }

    await assertion;

    // Enforce retry contract: verify exactly database_retry_attempts fetch calls were made
    expect(fetchMock).toHaveBeenCalledTimes(SETTINGS.database_retry_attempts);

    // Note: If apiRequest is updated to include retry metadata in headers or request options
    // (e.g., 'X-Retry-Attempt' header), add assertion here to verify the last call contains
    // attempt indicator equal to SETTINGS.database_retry_attempts
  });

  it('shows loading dialog after slow_request_threshold ms for a slow request', async () => {
    let resolveFetch!: (value: Response) => void;
    const slowResponse = new Promise<Response>((resolve) => { resolveFetch = resolve; });
    global.fetch = vi.fn().mockReturnValueOnce(slowResponse);

    const config = createApiConfig();
    const promise = apiRequest(config);

    await vi.advanceTimersByTimeAsync(SETTINGS.slow_request_threshold);
    expect(mockSetShowSpinUpDialog).toHaveBeenCalledWith(true);
    expect(mockSetRetryCount).toHaveBeenCalledWith(0);

    resolveFetch({ ok: true, json: async () => ({ value: { data: 'done' } }) } as Response);
    await promise;
    expect(mockSetShowSpinUpDialog).toHaveBeenCalledWith(false);
  });

  it('does not show loading dialog when request resolves before slow_request_threshold', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ value: {} }) });

    const config = createApiConfig();
    await apiRequest(config);

    expect(mockSetShowSpinUpDialog).not.toHaveBeenCalledWith(true);
    expect(mockSetShowSpinUpDialog).toHaveBeenCalledWith(false);
  });

  it('retries on failure and succeeds eventually', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
      .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ value: { data: 'success' } }) });

    const config = createApiConfig();
    const promise = apiRequest(config);

    // advance past each retry's setTimeout to unblock the next attempt
    await vi.advanceTimersByTimeAsync(SETTINGS.database_retry_delay);
    await vi.advanceTimersByTimeAsync(SETTINGS.database_retry_delay);

    const response = await promise;

    expect(response).toEqual({ value: { data: 'success' } });
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(mockSetShowSpinUpDialog).toHaveBeenCalledWith(true);
    expect(mockSetRetryCount).toHaveBeenCalledWith(1);
    expect(mockSetRetryCount).toHaveBeenCalledWith(2);
  });

  it('does not retry on 4xx client errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400, statusText: 'Bad Request' });

    const config = createApiConfig();
    await expect(apiRequest(config)).rejects.toThrow('Failed to fetch data: Bad Request');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockSetShowSpinUpDialog).not.toHaveBeenCalledWith(true);
  });

  it('supports POST requests with body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: { id: 123 } }),
    });

    const config = createApiConfig({
      method: 'POST' as const,
      body: { name: 'Test', value: 42 },
    });
    const response = await apiRequest(config);

    expect(response).toEqual({ value: { id: 123 } });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Test', value: 42 }),
      }),
    );
  });

  it('supports PATCH requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: { updated: true } }),
    });

    const config = createApiConfig({
      method: 'PATCH' as const,
      body: { status: 'active' },
    });
    await apiRequest(config);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      }),
    );
  });

  it('supports DELETE requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: { deleted: true } }),
    });

    const config = createApiConfig({
      method: 'DELETE' as const,
    });
    await apiRequest(config);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });
});
