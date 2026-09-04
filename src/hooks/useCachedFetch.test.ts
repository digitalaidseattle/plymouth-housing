/**
 *  useCachedFetch.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCachedFetch, labelled } from './useCachedFetch';

const EMPTY: string[] = [];

type Overrides = Partial<Parameters<typeof useCachedFetch<string[]>>[0]>;

const options = (overrides: Overrides = {}) => ({
  cacheKey: 'testKey',
  variant: 'v1',
  ttl: 60_000,
  initial: EMPTY,
  fetcher: () => Promise.resolve(['a']),
  errorLabel: 'Error fetching test data',
  onError: vi.fn(),
  reloadToken: 0,
  ...overrides,
});

describe('useCachedFetch', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('fetches, exposes the data, and stops loading', async () => {
    const { result } = renderHook(() => useCachedFetch(options()));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(['a']);
    expect(result.current.fetchedAt).not.toBeNull();
  });

  // A fresh arrow every render must not retrigger the effect.
  test('does not refetch when only the fetcher identity changes', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['a']));
    const { result, rerender } = renderHook(() =>
      useCachedFetch(options({ fetcher: () => fetcher() })),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender();
    rerender();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  test('serves a second mount from the cache without refetching', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['a']));
    const first = renderHook(() => useCachedFetch(options({ fetcher })));
    await waitFor(() => expect(first.result.current.isLoading).toBe(false));

    const second = renderHook(() => useCachedFetch(options({ fetcher })));
    await waitFor(() => expect(second.result.current.isLoading).toBe(false));

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(second.result.current.data).toEqual(['a']);
  });

  test('refetches when the variant changes', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['a']));
    const { result, rerender } = renderHook(
      ({ variant }) => useCachedFetch(options({ fetcher, variant })),
      { initialProps: { variant: 'v1' } },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ variant: 'v2' });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });

  test('refetches when the reload token changes', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['a']));
    const { result, rerender } = renderHook(
      ({ token }) => useCachedFetch(options({ fetcher, reloadToken: token })),
      { initialProps: { token: 0 } },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    sessionStorage.clear();
    rerender({ token: 1 });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });

  test('ignores a cached entry filled under a different variant', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['a']));
    const first = renderHook(() => useCachedFetch(options({ fetcher })));
    await waitFor(() => expect(first.result.current.isLoading).toBe(false));

    const second = renderHook(() =>
      useCachedFetch(options({ fetcher, variant: 'v2' })),
    );
    await waitFor(() => expect(second.result.current.isLoading).toBe(false));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  test('reports a failure, clears the data, and caches nothing', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useCachedFetch(
        options({ fetcher: () => Promise.reject(new Error('down')), onError }),
      ),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(result.current.fetchedAt).toBeNull();
    expect(onError).toHaveBeenCalledWith('Error fetching test data: down');
    expect(sessionStorage.getItem('testKey')).toBeNull();
  });
});

describe('labelled', () => {
  test('passes a resolved value through untouched', async () => {
    await expect(labelled('checkouts', Promise.resolve(1))).resolves.toBe(1);
  });

  test('names the failing request in the rejection', async () => {
    await expect(
      labelled('checkouts', Promise.reject(new Error('down'))),
    ).rejects.toThrow('checkouts (down)');
  });
});
