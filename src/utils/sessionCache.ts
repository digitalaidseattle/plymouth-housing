import { SETTINGS } from '../types/constants';

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

export function cacheGet<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry.cachedAt || Date.now() - entry.cachedAt > SETTINGS.cache_ttl) {
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
  sessionStorage.setItem(key, JSON.stringify(entry));
}
