/**
 *  useCachedFetch.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cacheGet, cacheSet } from '../utils/sessionCache';

interface Entry<T> {
  variant: string;
  fetchedAt: number;
  data: T;
}

interface CachedFetchOptions<T> {
  cacheKey: string;
  // Everything the fetcher reads, as one string. A change refetches, and a
  // cached entry only answers for the variant it was filled with. This is the
  // only trigger, so anything the fetcher depends on has to appear here.
  variant: string;
  ttl: number;
  initial: T;
  fetcher: () => Promise<T>;
  errorLabel: string;
  onError: (message: string) => void;
  // Incremented by the caller's Refresh button.
  reloadToken: number;
}

export function useCachedFetch<T>({
  cacheKey,
  variant,
  ttl,
  initial,
  fetcher,
  errorLabel,
  onError,
  reloadToken,
}: CachedFetchOptions<T>) {
  const [data, setData] = useState<T>(initial);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Held in a ref so the fetch effect depends only on primitives. Callers can
  // pass plain inline arrows without their changing identity refetching every
  // render, and `variant` stays the single trigger.
  const latest = useRef({ fetcher, onError, initial });
  useLayoutEffect(() => {
    latest.current = { fetcher, onError, initial };
  });

  useEffect(() => {
    const cached = cacheGet<Entry<T>>(cacheKey, ttl);
    if (cached && cached.variant === variant) {
      setData(cached.data);
      setFetchedAt(cached.fetchedAt);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    latest.current
      .fetcher()
      .then((result) => {
        if (!mounted) return;
        const fetchedAt = Date.now();
        setData(result);
        setFetchedAt(fetchedAt);
        cacheSet<Entry<T>>(cacheKey, { variant, fetchedAt, data: result });
      })
      .catch((error) => {
        if (!mounted) return;
        // Cleared rather than left alone, so the page never shows one range's
        // numbers under another range's heading.
        setData(latest.current.initial);
        setFetchedAt(null);
        latest.current.onError(`${errorLabel}: ${message(error)}`);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [cacheKey, variant, ttl, errorLabel, reloadToken]);

  return { data, fetchedAt, isLoading };
}

const message = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// Names the failing request, so one rejection out of several still says which.
export const labelled = <T>(label: string, request: Promise<T>): Promise<T> =>
  request.catch((error) => {
    throw new Error(`${label} (${message(error)})`);
  });
