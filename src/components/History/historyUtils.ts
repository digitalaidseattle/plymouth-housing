import { Building } from '../../types/interfaces';

export const DATE_FORMATS = {
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

export const WELCOME_BASKET_ITEMS = {
  TWIN: 175,
  FULL: 176,
} as const;

export const CHECKOUT_QUANTITY_LIMIT = 10;

export function createHowLongAgoString(
  minutes: number,
  hours: number,
  days: number,
): string {
  const getTimeUnit = (): string => {
    if (days > 0) {
      return days === 1 ? '1 day' : `${days} days`;
    }
    if (hours > 0) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }
    return `${minutes} min`;
  };
  return `Created ${getTimeUnit()} ago`;
}

export function calculateTimeDifference(timestamp: string): {
  minutes: number;
  hours: number;
  days: number;
} {
  const dateCreated = new Date(timestamp);
  const now = new Date();
  const seconds = (now.getTime() - dateCreated.getTime()) / 1000;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return { minutes, hours, days };
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const startStr = startDate.toLocaleString('en-us', DATE_FORMATS.DATE_ONLY);
  const endStr = endDate.toLocaleString('en-us', DATE_FORMATS.RANGE_END);
  return `${startStr} - ${endStr}`;
}

export function formatFullDate(date: Date): string {
  return date.toLocaleString('en-us', DATE_FORMATS.FULL_DATE);
}

export function findBuildingById(
  buildingId: number,
  buildings: Building[] | null,
): Building | undefined {
  return buildings?.find((b) => b.id === buildingId);
}

export function formatBuildingInfo(
  buildingId: number,
  buildings: Building[] | null,
): string {
  const building = findBuildingById(buildingId, buildings);
  return building ? `${building.code} - ${building.name}` : '';
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
