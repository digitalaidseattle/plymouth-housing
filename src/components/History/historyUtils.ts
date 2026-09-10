/**
 *  historyUtils.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
const DATE_FORMATS = {
  DATE_ONLY: {
    month: 'short' as const,
    day: 'numeric' as const,
  },
  FULL_DATE: {
    weekday: 'long' as const,
    year: 'numeric' as const,
    month: 'short' as const,
    day: 'numeric' as const,
  },
  RANGE_END: {
    year: 'numeric' as const,
    month: 'short' as const,
    day: 'numeric' as const,
  },
  TIME_ONLY: {
    hour: 'numeric' as const,
    minute: '2-digit' as const,
    hour12: true,
  },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const HAS_OFFSET = /(?:Z|[+-]\d{2}:\d{2})$/i;

// SQL Server DATETIME columns carry no offset, and the database records them in
// UTC. Left bare, JavaScript would read them as local time and shift the day.
export const parseTimestamp = (timestamp: string): Date =>
  new Date(HAS_OFFSET.test(timestamp) ? timestamp : `${timestamp}Z`);

// Inclusive calendar days between two local dates.
export const calendarDays = (start: Date, end: Date): number => {
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  ).getTime();
  const endDay = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  ).getTime();
  return Math.round((endDay - startDay) / MS_PER_DAY) + 1;
};

// Local calendar day of an instant, as a YYYY-M-D key.
export const dayKey = (timestamp: string): string => {
  const date = parseTimestamp(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const formatShortDate = (timestamp: string): string =>
  parseTimestamp(timestamp).toLocaleString('en-us', DATE_FORMATS.RANGE_END);

export const formatClockTime = (epochMs: number): string =>
  new Date(epochMs).toLocaleString('en-us', DATE_FORMATS.TIME_ONLY);

export function formatTransactionDate(
  timestamp: string,
  userName?: string,
  action = 'Created',
): string {
  const dateCreated = parseTimestamp(timestamp);
  const now = new Date();

  const actionPart = action ? `${action} ` : '';

  const isToday =
    dateCreated.getFullYear() === now.getFullYear() &&
    dateCreated.getMonth() === now.getMonth() &&
    dateCreated.getDate() === now.getDate();

  const datePart = isToday ? 'today' : formatShortDate(timestamp);
  const timePart = dateCreated.toLocaleString('en-us', DATE_FORMATS.TIME_ONLY);
  const userNamePart = userName ? `, by ${userName}` : '';

  return `${actionPart}${datePart} at ${timePart}${userNamePart}`;
}

// The year only rides on the end of the range, as it does elsewhere in the app.
export function formatDateRange(startDate: Date, endDate: Date): string {
  const startStr = startDate.toLocaleString('en-us', DATE_FORMATS.DATE_ONLY);
  const endStr = endDate.toLocaleString('en-us', DATE_FORMATS.RANGE_END);
  return `${startStr} - ${endStr}`;
}

// The range with the days it covers and how many of them saw a checkout, e.g.
// "Sep 1 - Sep 9, 2026 (9 days, 3 active days)", or just the date on its own when
// the range is a single day.
export function formatDateRangeSummary(
  startDate: Date,
  endDate: Date,
  activeDays: number,
): string {
  const days = calendarDays(startDate, endDate);
  return days === 1
    ? startDate.toLocaleString('en-us', DATE_FORMATS.RANGE_END)
    : `${formatDateRange(startDate, endDate)} (${days} days, ${activeDays} active days)`;
}

export function formatFullDate(date: Date): string {
  return date.toLocaleString('en-us', DATE_FORMATS.FULL_DATE);
}

export function getPresetDateRange(preset: string): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  switch (preset) {
    case 'this-month': {
      return {
        startDate: new Date(year, month, 1),
        endDate: new Date(year, month + 1, 0),
      };
    }
    case 'last-month': {
      return {
        startDate: new Date(year, month - 1, 1),
        endDate: new Date(year, month, 0),
      };
    }
    case 'last-30-days': {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return {
        startDate: thirtyDaysAgo,
        endDate: now,
      };
    }
    default: {
      return {
        startDate: now,
        endDate: now,
      };
    }
  }
}
