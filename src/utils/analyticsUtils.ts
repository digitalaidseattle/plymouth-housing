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
  InventoryTransaction,
} from '../types/interfaces';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Inclusive calendar days between two local-midnight ISO instants.
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
  const rangeDays = calendarDays(startDate, endDate);
  return {
    residentsServed: new Set(transactions.map((t) => t.resident_id)).size,
    checkouts,
    itemsCheckedOut: transactions.reduce((sum, t) => sum + t.total_quantity, 0),
    avgCheckoutsPerDay: checkouts / rangeDays,
    rangeDays,
  };
};

// Keyed on resident_id, so two residents sharing a name stay two people.
export const flagDuplicates = (
  transactions: CheckoutTransaction[],
): (CheckoutTransaction & { isDuplicate: boolean; visitCount: number })[] => {
  const counts = new Map<number, number>();
  transactions.forEach((t) =>
    counts.set(t.resident_id, (counts.get(t.resident_id) ?? 0) + 1),
  );

  return transactions.map((t) => {
    const visitCount = counts.get(t.resident_id) ?? 0;
    return { ...t, isDuplicate: visitCount > 1, visitCount };
  });
};

export const countResidentsByBuilding = (
  transactions: CheckoutTransaction[],
): {
  building_code: string;
  building_name: string;
  residentCount: number;
  visitCount: number;
}[] => {
  const buildings = new Map<
    string,
    { building_name: string; residents: Set<number>; visitCount: number }
  >();
  transactions.forEach((t) => {
    const building = buildings.get(t.building_code) ?? {
      building_name: t.building_name,
      residents: new Set<number>(),
      visitCount: 0,
    };
    building.residents.add(t.resident_id);
    building.visitCount += 1;
    buildings.set(t.building_code, building);
  });
  return Array.from(buildings.entries())
    .map(([building_code, { building_name, residents, visitCount }]) => ({
      building_code,
      building_name,
      residentCount: residents.size,
      visitCount,
    }))
    .sort((a, b) => b.residentCount - a.residentCount);
};

export const sumItemsAdded = (transactions: InventoryTransaction[]): number =>
  transactions.reduce((sum, t) => sum + t.quantity, 0);

export const topItemsAdded = (
  transactions: InventoryTransaction[],
  limit: number,
): { item_name: string; total_quantity: number }[] => {
  const totals = new Map<string, number>();
  transactions.forEach((t) =>
    totals.set(t.item_name, (totals.get(t.item_name) ?? 0) + t.quantity),
  );
  return Array.from(totals.entries())
    .map(([item_name, total_quantity]) => ({ item_name, total_quantity }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, limit);
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
      // Sign orders it: negative stock, then zero, then the rest.
      const signDiff = Math.sign(a.quantity) - Math.sign(b.quantity);
      if (signDiff !== 0) return signDiff;
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
