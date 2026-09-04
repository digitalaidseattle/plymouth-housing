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
  // Everything the fetcher reads. The only refetch trigger, so anything the
  // fetcher depends on has to appear here.
  variant: string;
  ttl: number;
  initial: T;
  fetcher: () => Promise<T>;
  errorLabel: string;
  onError: (message: string) => void;
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

  // Ref'd so the effect depends only on primitives and inline arrows are safe.
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
        // Cleared, so one range's numbers never sit under another's heading.
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

// Names the failing request when several are awaited together.
export const labelled = <T>(label: string, request: Promise<T>): Promise<T> =>
  request.catch((error) => {
    throw new Error(`${label} (${message(error)})`);
  });
