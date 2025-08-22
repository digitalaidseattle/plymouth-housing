
import { renderHook } from '@testing-library/react';
import { useInactivityTimer } from './useInactivityTimer';
import { vi } from 'vitest';

describe('useInactivityTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call onInactivity after the specified timeout', () => {
    const onInactivity = vi.fn();
    renderHook(() => useInactivityTimer({ onInactivity, timeout: 1000 }));

    expect(onInactivity).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(onInactivity).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer on user activity', () => {
    const onInactivity = vi.fn();
    renderHook(() => useInactivityTimer({ onInactivity, timeout: 1000 }));

    vi.advanceTimersByTime(500);

    // Simulate user activity
    document.dispatchEvent(new MouseEvent('mousemove'));

    vi.advanceTimersByTime(500);

    expect(onInactivity).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(onInactivity).toHaveBeenCalledTimes(1);
  });

  it('should clean up the timer on unmount', () => {
    const onInactivity = vi.fn();
    const { unmount } = renderHook(() => useInactivityTimer({ onInactivity, timeout: 1000 }));

    unmount();

    vi.advanceTimersByTime(1000);

    expect(onInactivity).not.toHaveBeenCalled();
  });
});
