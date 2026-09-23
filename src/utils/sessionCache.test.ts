/**
 *  sessionCache.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cacheGet, cacheSet, cacheTimestamp } from './sessionCache';

describe('sessionCache', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('returns the cached data and timestamp', () => {
    cacheSet('key', { a: 1 });

    expect(cacheGet('key')).toEqual({ a: 1 });
    expect(cacheTimestamp('key')).toEqual(expect.any(Number));
  });

  it('returns null when storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(cacheGet('key')).toBeNull();
    expect(cacheTimestamp('key')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
