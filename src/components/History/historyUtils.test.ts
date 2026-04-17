/// <reference types="node" />
import { describe, test, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';

const savedTZ = process.env.TZ;
process.env.TZ = 'UTC';
import {
  formatTransactionDate,
  formatDateRange,
  formatFullDate,

} from './historyUtils';

afterAll(() => {
  process.env.TZ = savedTZ;
});

describe('formatTransactionDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns "Created today at ..." for a timestamp from today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
    const result = formatTransactionDate('2025-06-15T14:00:00Z');
    expect(result).toMatch(/^Created today at /);
  });

  test('returns date string for a past day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
    const result = formatTransactionDate('2025-06-10T09:00:00Z');
    expect(result).toMatch(/^Created Jun 10, 2025 at /);
  });

  test('Z and +00:00 resolve to the same date (no double timezone)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
    const withZ = formatTransactionDate('2025-06-15T14:00:00Z');
    const withOffset = formatTransactionDate('2025-06-15T14:00:00+00:00');
    expect(withZ).toBe(withOffset);
  });

  test('bare timestamp (no timezone) is treated as UTC', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
    const withZ = formatTransactionDate('2025-06-15T14:00:00Z');
    const bare = formatTransactionDate('2025-06-15T14:00:00');
    expect(bare).toBe(withZ);
  });

  test('handles timestamp with -05:00 offset', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T20:00:00Z'));
    // 15:00-05:00 = 20:00Z, same day
    const result = formatTransactionDate('2025-06-15T15:00:00-05:00');
    expect(result).toMatch(/^Created today at /);
  });
});

describe('formatDateRange', () => {
  test('formats start and end date as readable range', () => {
    const start = new Date('2025-01-01T00:00:00Z');
    const end = new Date('2025-01-31T00:00:00Z');
    const result = formatDateRange(start, end);
    expect(result).toContain(' - ');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2025/);
  });
});

describe('formatFullDate', () => {
  test('includes weekday, month, day, year', () => {
    const date = new Date('2025-01-06T12:00:00Z');
    const result = formatFullDate(date);
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/Jan/);
  });
});

describe('formatTransactionDate - America/New_York timezone', () => {
  beforeAll(() => {
    process.env.TZ = 'America/New_York';
  });

  afterAll(() => {
    process.env.TZ = 'UTC';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('timestamp just after UTC midnight shows previous local date in New York', () => {
    vi.useFakeTimers();
    // "now" is Jun 15 at 2 PM UTC = Jun 15 at 10 AM EDT
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
    // 00:30Z on Jun 15 = 8:30 PM EDT on Jun 14 — a different local date
    const result = formatTransactionDate('2025-06-15T00:30:00Z');
    expect(result).toMatch(/^Created Jun 14, 2025 at /);
  });
});
