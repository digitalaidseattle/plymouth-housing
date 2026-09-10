/**
 *  historyUtils.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
/// <reference types="node" />
import { describe, test, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';

const savedTZ = process.env.TZ;
process.env.TZ = 'UTC';
import {
  formatTransactionDate,
  formatDateRange,
  formatDateRangeSummary,
  formatFullDate,
  formatClockTime,
  formatShortDate,
  dayKey,
  parseTimestamp,
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

describe('parseTimestamp', () => {
  // The API returns SQL Server DATETIME values with no offset. Reading those as
  // local time would shift the day for anyone outside UTC.
  test('reads a timestamp with no offset as UTC', () => {
    expect(parseTimestamp('2026-08-12T23:00:00').getTime()).toBe(
      Date.parse('2026-08-12T23:00:00Z'),
    );
  });

  test('honours an offset when the timestamp carries one', () => {
    expect(parseTimestamp('2026-08-12T18:00:00-05:00').getTime()).toBe(
      Date.parse('2026-08-12T23:00:00Z'),
    );
  });
});

describe('formatShortDate', () => {
  test('formats an ISO date as "Mon D, YYYY"', () => {
    expect(formatShortDate('2026-08-12T12:00:00.000Z')).toBe('Aug 12, 2026');
  });

  test('lands on the same day with or without a trailing Z', () => {
    expect(formatShortDate('2026-08-12T23:00:00')).toBe(
      formatShortDate('2026-08-12T23:00:00Z'),
    );
  });
});

describe('dayKey', () => {
  test('lands on the same day with or without a trailing Z', () => {
    expect(dayKey('2026-08-12T23:00:00')).toBe(dayKey('2026-08-12T23:00:00Z'));
  });

  test('separates two instants that fall on different local days', () => {
    expect(dayKey(new Date(2026, 7, 12, 12).toISOString())).not.toBe(
      dayKey(new Date(2026, 7, 13, 12).toISOString()),
    );
  });
});

describe('formatClockTime', () => {
  test('shows a 12-hour time with a padded minute', () => {
    const time = formatClockTime(new Date(2026, 7, 12, 14, 5).getTime());
    expect(time).toMatch(/^\d{1,2}:\d{2}[\s ](AM|PM)$/);
  });
});

describe('formatDateRangeSummary', () => {
  test('counts both ends of a multi-day range', () => {
    expect(
      formatDateRangeSummary(new Date(2026, 8, 1), new Date(2026, 8, 9), 4),
    ).toBe('Sep 1 - Sep 9, 2026 (9 days, 4 active days)');
  });

  test('shows a single day as just the date', () => {
    expect(
      formatDateRangeSummary(new Date(2026, 8, 9), new Date(2026, 8, 9), 1),
    ).toBe('Sep 9, 2026');
  });

  test('ignores the time of day on either end', () => {
    expect(
      formatDateRangeSummary(
        new Date(2026, 8, 1, 23, 30),
        new Date(2026, 8, 2, 0, 15),
        2,
      ),
    ).toBe('Sep 1 - Sep 2, 2026 (2 days, 2 active days)');
  });

  test('echoes the active-day count it is handed', () => {
    expect(
      formatDateRangeSummary(new Date(2026, 8, 7), new Date(2026, 8, 13), 3),
    ).toBe('Sep 7 - Sep 13, 2026 (7 days, 3 active days)');
  });
});

describe('formatTransactionDate - userName and action params', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('appends ", by <name>" when userName is provided', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
    const result = formatTransactionDate('2025-06-10T09:00:00Z', 'Alice');
    expect(result).toMatch(/, by Alice$/);
  });

  test('uses custom action prefix', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
    const result = formatTransactionDate('2025-06-15T14:00:00Z', undefined, 'Edited');
    expect(result).toMatch(/^Edited today at /);
  });

  test('omits action prefix when action is empty string', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
    const result = formatTransactionDate('2025-06-15T14:00:00Z', undefined, '');
    expect(result).toMatch(/^today at /);
  });

  test('combines custom action and userName', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'));
    const result = formatTransactionDate('2025-06-10T09:00:00Z', 'Bob', 'Updated');
    expect(result).toMatch(/^Updated Jun 10, 2025 at /);
    expect(result).toMatch(/, by Bob$/);
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
