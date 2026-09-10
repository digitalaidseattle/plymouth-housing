/**
 *  analyticsUtils.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  calendarDays,
  dayKey,
  formatShortDate,
} from '../components/History/historyUtils';
import {
  AnalyticsSummary,
  BuildingResidents,
  CheckoutTransaction,
  DateRangeStrings,
  FlaggedTransaction,
  InventoryItem,
  InventoryTransaction,
  RankedItem,
  TransactionType,
} from '../types/interfaces';
import { CsvSection } from './csvExport';

export const summarizeCheckouts = (
  transactions: CheckoutTransaction[],
  startDate: string,
  endDate: string,
): AnalyticsSummary => {
  const checkouts = transactions.length;
  const rangeDays = calendarDays(new Date(startDate), new Date(endDate));
  // Averaged over days that saw a checkout, so quiet days don't drag it down.
  const activeDays = new Set(
    transactions.map((t) => dayKey(t.transaction_date)),
  ).size;
  return {
    residentsServed: new Set(transactions.map((t) => t.resident_id)).size,
    checkouts,
    itemsCheckedOut: transactions.reduce((sum, t) => sum + t.total_quantity, 0),
    activeDays,
    avgCheckoutsPerActiveDay: activeDays === 0 ? 0 : checkouts / activeDays,
    rangeDays,
  };
};

// Keyed on resident_id, so two residents sharing a name stay two people.
export const flagDuplicates = (
  transactions: CheckoutTransaction[],
): FlaggedTransaction[] => {
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
): BuildingResidents[] => {
  const buildings = new Map<
    string,
    { residents: Set<number>; visitCount: number }
  >();
  transactions.forEach((t) => {
    const building = buildings.get(t.building_code) ?? {
      residents: new Set<number>(),
      visitCount: 0,
    };
    building.residents.add(t.resident_id);
    building.visitCount += 1;
    buildings.set(t.building_code, building);
  });
  return Array.from(buildings.entries())
    .map(([building_code, { residents, visitCount }]) => ({
      building_code,
      residentCount: residents.size,
      visitCount,
    }))
    .sort((a, b) => b.residentCount - a.residentCount);
};

// Inventory history also carries value corrections; only adds are stock in.
export const onlyAdds = (
  rows: InventoryTransaction[],
): InventoryTransaction[] =>
  rows.filter((t) => t.transaction_type === TransactionType.InventoryAdd);

export const sumItemsAdded = (transactions: InventoryTransaction[]): number =>
  transactions.reduce((sum, t) => sum + t.quantity, 0);

export const topItemsAdded = (
  transactions: InventoryTransaction[],
  limit: number,
): RankedItem[] => {
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

// Counted in calendar days rather than milliseconds, so the window either side of a
// clock change is still the same number of days and still starts at local midnight.
export const previousPeriod = (
  startDate: string,
  endDate: string,
): DateRangeStrings => {
  const start = new Date(startDate);
  const days = calendarDays(start, new Date(endDate));
  const year = start.getFullYear();
  const month = start.getMonth();
  const day = start.getDate();
  return {
    startDate: new Date(year, month, day - days, 0, 0, 0, 0).toISOString(),
    endDate: new Date(year, month, day - 1, 23, 59, 59, 999).toISOString(),
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

interface AnalyticsExport {
  dateRangeString: string;
  buildingName: string;
  repeatsOnly: boolean;
  statTiles: { label: string; value: string }[];
  avgCheckoutsPerActiveDay?: string;
  residentsByBuilding: BuildingResidents[];
  topCheckedOutItems: RankedItem[];
  topInventoryAdded: RankedItem[];
  leastCheckedOutItems: RankedItem[];
  detailRows: FlaggedTransaction[];
  lowStockRows: InventoryItem[];
  checkedOutById: Map<number, number>;
}

// The three ranked-item panels differ only by title and what the count means.
const rankedSection = (
  title: string,
  quantityHeader: string,
  items: RankedItem[],
): CsvSection => ({
  title,
  headers: ['Item', quantityHeader],
  rows: items.map((item) => [item.item_name, item.total_quantity]),
});

// One section per panel on the page, in the order they are shown.
export const buildAnalyticsSections = ({
  dateRangeString,
  buildingName,
  repeatsOnly,
  statTiles,
  avgCheckoutsPerActiveDay,
  residentsByBuilding,
  topCheckedOutItems,
  topInventoryAdded,
  leastCheckedOutItems,
  detailRows,
  lowStockRows,
  checkedOutById,
}: AnalyticsExport): CsvSection[] => [
  {
    title: 'Filters',
    headers: ['Field', 'Value'],
    rows: [
      ['Date range', dateRangeString],
      ['Building', buildingName],
      ['Repeats only', repeatsOnly ? 'Yes' : 'No'],
    ],
  },
  {
    // Built from the tiles themselves, so the two can't drift apart.
    title: 'Summary',
    headers: ['Metric', 'Value'],
    rows: [
      ...statTiles.map((tile) => [tile.label, tile.value]),
      ...(avgCheckoutsPerActiveDay
        ? [['Avg Checkouts / Active Day', avgCheckoutsPerActiveDay]]
        : []),
    ],
  },
  {
    title: 'Residents Served by Building',
    headers: ['Building', 'Residents'],
    rows: residentsByBuilding.map((b) => [b.building_code, b.residentCount]),
  },
  rankedSection('Top 10 Items Checked Out', 'Quantity', topCheckedOutItems),
  rankedSection(
    'Top 10 Inventory Items Added',
    'Quantity Added',
    topInventoryAdded,
  ),
  rankedSection('Least Checked Out Items', 'Quantity', leastCheckedOutItems),
  {
    title: 'Residents Served',
    headers: [
      'Resident',
      'Building',
      'Unit',
      '# Visits',
      '# Items',
      'Transaction Date',
    ],
    rows: detailRows.map((row) => [
      row.resident_name,
      row.building_code,
      row.unit_number.trim(),
      row.visitCount,
      row.total_quantity,
      formatShortDate(row.transaction_date),
    ]),
  },
  {
    title: 'Low Stock & High Need',
    headers: [
      'Item',
      'Category',
      'Status',
      'Current Qty',
      'Threshold',
      'Checked Out',
    ],
    rows: lowStockRows.map((item) => [
      item.name,
      item.category,
      item.status,
      item.quantity,
      item.threshold,
      checkedOutById.get(item.id) || '',
    ]),
  },
];
