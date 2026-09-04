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
  const rangeDays = calendarDays(startDate, endDate);
  return {
    residentsServed: new Set(transactions.map((t) => t.resident_id)).size,
    checkouts,
    itemsCheckedOut: transactions.reduce((sum, t) => sum + t.total_quantity, 0),
    avgCheckoutsPerDay: checkouts / rangeDays,
    rangeDays,
  };
};

// Lowercased, punctuation stripped, whitespace collapsed. "John  O'Brien-Doe"
// becomes "john obrien doe" so cosmetic differences don't split a resident.
const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const levenshtein = (a: string, b: string): number => {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr.push(Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost));
    }
    prev = curr;
  }
  return prev[b.length];
};

// Two edits covers the common typo cases (John/Jon, missing letter, swapped
// letter); the length floor keeps short names like "Al" / "Ed" from colliding.
const MAX_NAME_EDITS = 2;
const MIN_FUZZY_LENGTH = 6;

const fuzzyEqualNormalized = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  if (a === b) return true;
  if (Math.max(a.length, b.length) < MIN_FUZZY_LENGTH) return false;
  if (Math.abs(a.length - b.length) > MAX_NAME_EDITS) return false;
  return levenshtein(a, b) <= MAX_NAME_EDITS;
};

// Same resident recorded under near-identical names (spelling drift, a typo).
export const namesLikelyMatch = (a: string, b: string): boolean =>
  fuzzyEqualNormalized(normalizeName(a), normalizeName(b));

// Flags every checkout that belongs to a resident seen more than once in the
// list. Residents are matched client-side by name similarity, not just id, so a
// misspelled repeat visit ("Jon Doe" after "John Doe") still gets caught; an
// exact id match links spellings that are too far apart for the fuzzy check.
export const flagDuplicates = (
  transactions: CheckoutTransaction[],
): (CheckoutTransaction & { isDuplicate: boolean })[] => {
  const keyOf = (t: CheckoutTransaction) => normalizeName(t.resident_name);
  const names = [...new Set(transactions.map(keyOf))].filter(Boolean);

  const parent = new Map(names.map((name) => [name, name]));
  const find = (x: string): string => {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  const nameByResident = new Map<number, string>();
  transactions.forEach((t) => {
    const name = keyOf(t);
    if (!name) return;
    const seen = nameByResident.get(t.resident_id);
    if (seen === undefined) nameByResident.set(t.resident_id, name);
    else if (seen !== name) union(seen, name);
  });

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (fuzzyEqualNormalized(names[i], names[j])) union(names[i], names[j]);
    }
  }

  const countByCluster = new Map<string, number>();
  transactions.forEach((t) => {
    const name = keyOf(t);
    if (!name) return;
    const cluster = find(name);
    countByCluster.set(cluster, (countByCluster.get(cluster) ?? 0) + 1);
  });

  return transactions.map((t) => {
    const name = keyOf(t);
    return {
      ...t,
      isDuplicate: name ? (countByCluster.get(find(name)) ?? 0) > 1 : false,
    };
  });
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

export const sumItemsAdded = (transactions: InventoryTransaction[]): number =>
  transactions.reduce((sum, t) => sum + t.quantity, 0);

// Inventory-add transactions rolled up by item, highest quantity first, capped
// at `limit`. Mirrors the "Top Items Checked Out" ranking on the same page.
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
      if (a.status === 'Out of Stock' && b.status !== 'Out of Stock') return -1;
      if (b.status === 'Out of Stock' && a.status !== 'Out of Stock') return 1;
      const deltaDiff = a.quantity - a.threshold - (b.quantity - b.threshold);
      return deltaDiff !== 0 ? deltaDiff : a.name.localeCompare(b.name);
    });

// Stock movement reads as a direction rather than a bare count: items leaving
// carry a minus, items arriving a plus. Zero stays unsigned.
export const formatSignedTotal = (total: number, sign: '+' | '-'): string =>
  total === 0 ? '0' : `${sign}${total}`;

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
