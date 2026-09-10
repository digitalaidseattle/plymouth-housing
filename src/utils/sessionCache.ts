/**
 *  sessionCache.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { SETTINGS } from '../types/constants';

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

// `ttl` overrides the default for callers whose data goes stale sooner.
export function cacheGet<T>(
  key: string,
  ttl: number = SETTINGS.cache_ttl,
): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry.cachedAt || Date.now() - entry.cachedAt > ttl) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export function cacheSet<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, cachedAt: Date.now() };
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // A full quota must not fail the caller: the data it just fetched is good,
    // only the cache write is lost.
    console.error(`Error caching "${key}":`, error);
  }
}

export function cacheRemove(key: string): void {
  sessionStorage.removeItem(key);
}
