/**
 *  useSnackbar.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSnackbar } from './useSnackbar';

describe('useSnackbar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('opens immediately when idle', () => {
    const { result } = renderHook(() => useSnackbar());
    act(() => result.current.showSnackbar('first'));
    expect(result.current.snackbarState).toMatchObject({
      open: true,
      message: 'first',
      severity: 'error',
    });
  });

  test('queues a message shown while another is open', () => {
    const { result } = renderHook(() => useSnackbar());
    act(() => result.current.showSnackbar('first'));
    act(() => result.current.showSnackbar('second', 'warning'));
    expect(result.current.snackbarState.message).toBe('first');

    act(() => result.current.handleClose());
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.snackbarState).toMatchObject({
      open: true,
      message: 'second',
      severity: 'warning',
    });
  });

  test('ignores clickaway close', () => {
    const { result } = renderHook(() => useSnackbar());
    act(() => result.current.showSnackbar('first'));
    act(() => result.current.handleClose(undefined, 'clickaway'));
    expect(result.current.snackbarState.open).toBe(true);
  });

  test('resetSnackbar closes the open message', () => {
    const { result } = renderHook(() => useSnackbar());
    act(() => result.current.showSnackbar('first'));
    act(() => result.current.resetSnackbar());
    expect(result.current.snackbarState.open).toBe(false);
  });

  test('resetSnackbar drops queued messages', () => {
    const { result } = renderHook(() => useSnackbar());
    act(() => result.current.showSnackbar('first'));
    act(() => result.current.showSnackbar('second'));
    act(() => result.current.resetSnackbar());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.snackbarState.open).toBe(false);
  });

  test('shows new messages normally after a reset', () => {
    const { result } = renderHook(() => useSnackbar());
    act(() => result.current.showSnackbar('first'));
    act(() => result.current.resetSnackbar());
    act(() => result.current.showSnackbar('again'));
    expect(result.current.snackbarState).toMatchObject({
      open: true,
      message: 'again',
    });
  });

  test('resetSnackbar is a no-op when idle and keeps a stable identity', () => {
    const { result } = renderHook(() => useSnackbar());
    const reset = result.current.resetSnackbar;
    act(() => result.current.resetSnackbar());
    expect(result.current.snackbarState.open).toBe(false);
    expect(result.current.resetSnackbar).toBe(reset);
  });
});
