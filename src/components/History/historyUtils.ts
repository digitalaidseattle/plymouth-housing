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
};

export function formatTransactionDate(timestamp: string, userName?: string, action = 'Created'): string {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp);
  const dateCreated = new Date(hasTimezone ? timestamp : timestamp + 'Z');
  const now = new Date();

  const actionPart = action ? `${action} ` : '';

  const isToday =
    dateCreated.getFullYear() === now.getFullYear() &&
    dateCreated.getMonth() === now.getMonth() &&
    dateCreated.getDate() === now.getDate();

  let datePart = '';
  if (isToday) {
    datePart = 'today';
  }
  else {
    datePart = dateCreated.toLocaleString('en-us', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const timePart = dateCreated.toLocaleString('en-us', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const userNamePart = userName ? `, by ${userName}` : '';

  return `${actionPart}${datePart} at ${timePart}${userNamePart}`;
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const startStr = startDate.toLocaleString('en-us', DATE_FORMATS.DATE_ONLY);
  const endStr = endDate.toLocaleString('en-us', DATE_FORMATS.RANGE_END);
  return `${startStr} - ${endStr}`;
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
