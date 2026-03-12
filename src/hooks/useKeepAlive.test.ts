import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeepAlive } from './useKeepAlive';
import { ClientPrincipal } from '../types/interfaces';

describe('useKeepAlive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
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
    // Mock Wednesday at 2 PM Pacific Time
    const wednesdayAt2PM = new Date('2026-03-11T14:00:00-08:00');
    vi.setSystemTime(wednesdayAt2PM);

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
    // Mock Monday at 2 PM Pacific Time (not Wed/Thu)
    const mondayAt2PM = new Date('2026-03-09T14:00:00-08:00');
    vi.setSystemTime(mondayAt2PM);

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not ping on Wednesday before noon', () => {
    // Mock Wednesday at 11 AM Pacific Time
    const wednesdayAt11AM = new Date('2026-03-11T11:00:00-08:00');
    vi.setSystemTime(wednesdayAt11AM);

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should not ping on Thursday after 5 PM', () => {
    // Mock Thursday at 6 PM Pacific Time
    const thursdayAt6PM = new Date('2026-03-12T18:00:00-08:00');
    vi.setSystemTime(thursdayAt6PM);

    renderHook(() => useKeepAlive({ user: mockUser, enabled: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should ping on Thursday at 4 PM', () => {
    // Mock Thursday at 4 PM Pacific Time
    const thursdayAt4PM = new Date('2026-03-12T16:00:00-07:00'); // DST
    vi.setSystemTime(thursdayAt4PM);

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
});
