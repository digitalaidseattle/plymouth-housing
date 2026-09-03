/**
 *  analyticsUtils.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  AnalyticsSummary,
  CheckoutTransaction,
  InventoryItem,
} from '../types/interfaces';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Calendar days between two ISO dates, inclusive (same calendar day = 1).
// startDate/endDate are local-midnight instants (see useDateRangeFilter's
// formattedDateRange), so days are counted using local date parts.
const calendarDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
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

export const summarizeCheckouts = (
  transactions: CheckoutTransaction[],
  startDate: string,
  endDate: string,
): AnalyticsSummary => {
  const checkouts = transactions.length;
  return {
    residentsServed: new Set(transactions.map((t) => t.resident_id)).size,
    checkouts,
    itemsCheckedOut: transactions.reduce((sum, t) => sum + t.total_quantity, 0),
    avgCheckoutsPerDay: checkouts / calendarDays(startDate, endDate),
  };
};

export const flagDuplicates = (
  transactions: CheckoutTransaction[],
): (CheckoutTransaction & { isDuplicate: boolean })[] => {
  const countsByResident = new Map<number, number>();
  transactions.forEach((t) =>
    countsByResident.set(
      t.resident_id,
      (countsByResident.get(t.resident_id) ?? 0) + 1,
    ),
  );
  return transactions.map((t) => ({
    ...t,
    isDuplicate: (countsByResident.get(t.resident_id) ?? 0) > 1,
  }));
};

export const countResidentsByBuilding = (
  transactions: CheckoutTransaction[],
): {
  building_code: string;
  building_name: string;
  residentCount: number;
}[] => {
  const buildings = new Map<
    string,
    { building_name: string; residents: Set<number> }
  >();
  transactions.forEach((t) => {
    const building = buildings.get(t.building_code) ?? {
      building_name: t.building_name,
      residents: new Set<number>(),
    };
    building.residents.add(t.resident_id);
    buildings.set(t.building_code, building);
  });
  return Array.from(buildings.entries())
    .map(([building_code, { building_name, residents }]) => ({
      building_code,
      building_name,
      residentCount: residents.size,
    }))
    .sort((a, b) => b.residentCount - a.residentCount);
};

export const percentChange = (
  current: number,
  previous: number,
): number | null => {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
};

export const previousPeriod = (
  startDate: string,
  endDate: string,
): { startDate: string; endDate: string } => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const newEnd = start - 1;
  const newStart = start - (end - start + 1);
  return {
    startDate: new Date(newStart).toISOString(),
    endDate: new Date(newEnd).toISOString(),
  };
};

export const sortLowStockItems = (items: InventoryItem[]): InventoryItem[] =>
  items
    .filter((item) => item.quantity <= item.threshold)
    .sort((a, b) => {
      if (a.status === 'Out of Stock' && b.status !== 'Out of Stock') return -1;
      if (b.status === 'Out of Stock' && a.status !== 'Out of Stock') return 1;
      const deltaDiff = a.quantity - a.threshold - (b.quantity - b.threshold);
      return deltaDiff !== 0 ? deltaDiff : a.name.localeCompare(b.name);
    });

export const formatTransactionDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const formatLastUpdated = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
