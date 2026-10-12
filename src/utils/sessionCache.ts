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

function readRaw(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to read ${key} from sessionStorage`, error);
    return null;
  }
}

export function cacheGet<T>(
  key: string,
  ttl: number = SETTINGS.cache_ttl,
): T | null {
  const raw = readRaw(key);
  if (!raw) return null;

  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!Number.isFinite(entry.cachedAt) || Date.now() - entry.cachedAt > ttl) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export function cacheTimestamp(key: string): number | null {
  const raw = readRaw(key);
  if (!raw) return null;

  try {
    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    if (!Number.isFinite(entry.cachedAt) || Date.now() - entry.cachedAt > SETTINGS.cache_ttl) {
      return null;
    }
    return entry.cachedAt;
  } catch {
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
