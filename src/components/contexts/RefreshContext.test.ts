import { act, renderHook } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { useInterval } from './RefreshContext';

describe('useInterval tests', () => {
    beforeAll(() => {
        vi.useFakeTimers();
    });
    afterAll(() => {
        vi.useRealTimers();
    });
    
    it("should wait and callback", () => {
        const cb = vi.fn();
        const delay = 1000 * 10;
        renderHook(() => useInterval(cb, delay));

        act(() => {
            vi.advanceTimersByTime(delay); // Advance time by delay
        });
        expect(cb).toHaveBeenCalled();
    });
});
