import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeepAlive } from './useKeepAlive';
import { ClientPrincipal } from '../types/interfaces';
import * as appInsights from '../utils/appInsights';

describe('useKeepAlive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
    vi.spyOn(appInsights, 'trackException').mockImplementation(() => {});
    vi.spyOn(appInsights, 'trackEvent').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const mockUser: ClientPrincipal = {
    userID: 'test-user',
    userDetails: 'Test User',
    userRoles: ['volunteer'],
  };

  it('should not ping when user is null', () => {
    renderHook(() => useKeepAlive({ user: null, enabled: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not ping when enabled is false', () => {
    renderHook(() => useKeepAlive({ user: mockUser, enabled: false }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should ping immediately during business hours', () => {
    // Mock Wednesday at 2 PM Pacific Time (PDT in March)
    const wednesdayAt2PM = new Date('2026-03-11T14:00:00-07:00');
    vi.setSystemTime(wednesdayAt2PM);

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 200,
      statusText: 'OK',
    } as Response);

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/building'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'X-MS-API-ROLE': expect.any(String),
        }),
      })
    );
  });

  it('should not ping outside business hours', () => {
    // Mock Monday at 2 PM Pacific Time (PDT in March, not Wed/Thu)
    const mondayAt2PM = new Date('2026-03-09T14:00:00-07:00');
    vi.setSystemTime(mondayAt2PM);

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not ping on Wednesday before noon', () => {
    // Mock Wednesday at 11 AM Pacific Time (PDT in March)
    const wednesdayAt11AM = new Date('2026-03-11T11:00:00-07:00');
    vi.setSystemTime(wednesdayAt11AM);

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not ping on Thursday after 5 PM', () => {
    // Mock Thursday at 6 PM Pacific Time (PDT in March)
    const thursdayAt6PM = new Date('2026-03-12T18:00:00-07:00');
    vi.setSystemTime(thursdayAt6PM);

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should ping on Thursday at 4 PM', () => {
    // Mock Thursday at 4 PM Pacific Time
    const thursdayAt4PM = new Date('2026-03-12T16:00:00-07:00'); // DST
    vi.setSystemTime(thursdayAt4PM);

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 200,
      statusText: 'OK',
    } as Response);

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should clean up interval on unmount', () => {
    const { unmount } = renderHook(() =>
      useKeepAlive({ user: mockUser, enabled: true })
    );

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should track exception and event when receiving non-200 status', async () => {
    const wednesdayAt2PM = new Date('2026-03-11T14:00:00-07:00');
    vi.setSystemTime(wednesdayAt2PM);

    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      const result = {
        status: 500,
        statusText: 'Internal Server Error',
      } as Response;
      // Signal that fetch completed
      queueMicrotask(() => resolvePromise!());
      return result;
    });

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    // Wait for the ping to complete
    await promise;

    expect(appInsights.trackException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unexpected response status: 500',
      }),
      expect.objectContaining({
        component: 'useKeepAlive',
        action: 'pingBackend',
        status: '500',
        statusText: 'Internal Server Error',
      })
    );

    expect(appInsights.trackEvent).toHaveBeenCalledWith(
      'KeepAlive_Ping',
      expect.objectContaining({
        success: false,
        status: 500,
        statusText: 'Internal Server Error',
        component: 'useKeepAlive',
      })
    );
  });

  it('should track exception and event when fetch throws network error', async () => {
    const wednesdayAt2PM = new Date('2026-03-11T14:00:00-07:00');
    vi.setSystemTime(wednesdayAt2PM);

    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    const networkError = new Error('Network error');
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      // Signal that fetch will complete (with error)
      queueMicrotask(() => resolvePromise!());
      throw networkError;
    });

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    // Wait for the ping to complete
    await promise;

    expect(appInsights.trackException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Network error',
      }),
      expect.objectContaining({
        component: 'useKeepAlive',
        action: 'pingBackend',
        errorType: 'network_or_unexpected',
      })
    );

    expect(appInsights.trackEvent).toHaveBeenCalledWith(
      'KeepAlive_Ping',
      expect.objectContaining({
        success: false,
        errorMessage: 'Network error',
        component: 'useKeepAlive',
        errorType: 'network_or_unexpected',
      })
    );
  });

  it('should not track App Insights on successful ping', async () => {
    const wednesdayAt2PM = new Date('2026-03-11T14:00:00-07:00');
    vi.setSystemTime(wednesdayAt2PM);

    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      const result = {
        status: 200,
        statusText: 'OK',
      } as Response;
      // Signal that fetch completed
      queueMicrotask(() => resolvePromise!());
      return result;
    });

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    // Wait for the ping to complete
    await promise;

    expect(global.fetch).toHaveBeenCalled();
    expect(appInsights.trackException).not.toHaveBeenCalled();
    expect(appInsights.trackEvent).not.toHaveBeenCalled();
  });
});
