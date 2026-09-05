/**
 *  analyticsUtils.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, test, expect } from 'vitest';
import {
  summarizeCheckouts,
  flagDuplicates,
  countResidentsByBuilding,
  percentChange,
  previousPeriod,
  sortLowStockItems,
  sumItemsAdded,
  topItemsAdded,
  formatTransactionDate,
} from './analyticsUtils';
import {
  CheckoutTransaction,
  InventoryItem,
  InventoryTransaction,
  TransactionType,
} from '../types/interfaces';

const baseTransaction: CheckoutTransaction = {
  building_id: 1,
  building_code: 'A',
  building_name: 'Building A',
  item_type: 'general',
  resident_id: 10,
  resident_name: 'Resident A',
  transaction_date: '2025-01-01T00:00:00Z',
  transaction_id: 'txn-1',
  unit_number: '101',
  user_id: 1,
  welcome_basket_item_id: null,
  welcome_basket_quantity: null,
  total_quantity: 5,
  is_edited: false,
};

const makeTransaction = (
  overrides: Partial<CheckoutTransaction>,
): CheckoutTransaction => ({ ...baseTransaction, ...overrides });

const baseItem: InventoryItem = {
  id: 1,
  name: 'Item A',
  type: 'General',
  description: '',
  quantity: 5,
  threshold: 5,
  category: 'Category A',
  status: 'Low Stock',
};

const makeItem = (overrides: Partial<InventoryItem>): InventoryItem => ({
  ...baseItem,
  ...overrides,
});

// Mirrors useDateRangeFilter's formattedDateRange: local midnight start,
// local end-of-day end, each serialized with toISOString().
const localDateRange = (
  start: [number, number, number],
  end: [number, number, number] = start,
) => {
  const startDate = new Date(...start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(...end);
  endDate.setHours(23, 59, 59, 999);
  return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
};

describe('summarizeCheckouts', () => {
  test('returns zeroed summary for an empty array', () => {
    const { startDate, endDate } = localDateRange([2025, 0, 1]);
    const result = summarizeCheckouts([], startDate, endDate);
    expect(result).toEqual({
      residentsServed: 0,
      checkouts: 0,
      itemsCheckedOut: 0,
      avgCheckoutsPerDay: 0,
      rangeDays: 1,
    });
  });

  test('counts distinct residents, checkouts, and total items', () => {
    const transactions = [
      makeTransaction({
        transaction_id: 'txn-1',
        resident_id: 10,
        total_quantity: 5,
      }),
      makeTransaction({
        transaction_id: 'txn-2',
        resident_id: 10,
        total_quantity: 3,
      }),
      makeTransaction({
        transaction_id: 'txn-3',
        resident_id: 20,
        total_quantity: 2,
      }),
    ];
    const { startDate, endDate } = localDateRange([2025, 0, 1]);
    const result = summarizeCheckouts(transactions, startDate, endDate);
    expect(result.residentsServed).toBe(2);
    expect(result.checkouts).toBe(3);
    expect(result.itemsCheckedOut).toBe(10);
  });

  test('treats a single-day range as 1 calendar day', () => {
    const transactions = [makeTransaction({})];
    const { startDate, endDate } = localDateRange([2025, 0, 1]);
    const result = summarizeCheckouts(transactions, startDate, endDate);
    expect(result.avgCheckoutsPerDay).toBe(1);
  });

  test('divides checkouts across an inclusive multi-day range', () => {
    const transactions = [
      makeTransaction({}),
      makeTransaction({ transaction_id: 'txn-2' }),
    ];
    const { startDate, endDate } = localDateRange([2025, 0, 1], [2025, 0, 4]);
    const result = summarizeCheckouts(transactions, startDate, endDate);
    expect(result.avgCheckoutsPerDay).toBe(0.5);
    expect(result.rangeDays).toBe(4);
  });
});

describe('flagDuplicates', () => {
  test('flags no duplicates when each resident appears once', () => {
    const transactions = [
      makeTransaction({
        transaction_id: 'txn-1',
        resident_id: 10,
        resident_name: 'Alice Johnson',
      }),
      makeTransaction({
        transaction_id: 'txn-2',
        resident_id: 20,
        resident_name: 'Bob Williams',
      }),
    ];
    const result = flagDuplicates(transactions);
    expect(result.map((t) => t.isDuplicate)).toEqual([false, false]);
  });

  test('flags all transactions sharing a resident_id as duplicates', () => {
    const transactions = [
      makeTransaction({ transaction_id: 'txn-1', resident_id: 10 }),
      makeTransaction({ transaction_id: 'txn-2', resident_id: 10 }),
      makeTransaction({ transaction_id: 'txn-3', resident_id: 10 }),
    ];
    const result = flagDuplicates(transactions);
    expect(result.map((t) => t.isDuplicate)).toEqual([true, true, true]);
  });

  test('keeps distinct residents sharing a name apart', () => {
    const transactions = [
      makeTransaction({
        transaction_id: 'txn-1',
        resident_id: 10,
        resident_name: 'John Doe',
      }),
      makeTransaction({
        transaction_id: 'txn-2',
        resident_id: 11,
        resident_name: 'John Doe',
      }),
      makeTransaction({
        transaction_id: 'txn-3',
        resident_id: 12,
        resident_name: 'Jane Doe',
      }),
    ];
    const result = flagDuplicates(transactions);
    expect(result.map((t) => t.isDuplicate)).toEqual([false, false, false]);
    expect(result.map((t) => t.visitCount)).toEqual([1, 1, 1]);
  });

  test('preserves the original order', () => {
    const transactions = [
      makeTransaction({
        transaction_id: 'txn-1',
        resident_id: 10,
        resident_name: 'Alice Johnson',
      }),
      makeTransaction({
        transaction_id: 'txn-2',
        resident_id: 20,
        resident_name: 'Bob Williams',
      }),
    ];
    const result = flagDuplicates(transactions);
    expect(result.map((t) => t.transaction_id)).toEqual(['txn-1', 'txn-2']);
  });

  test('counts every transaction a resident made', () => {
    const transactions = [
      makeTransaction({ transaction_id: 'txn-1', resident_id: 10 }),
      makeTransaction({ transaction_id: 'txn-2', resident_id: 10 }),
      makeTransaction({ transaction_id: 'txn-3', resident_id: 10 }),
    ];
    const result = flagDuplicates(transactions);
    expect(result.map((t) => t.visitCount)).toEqual([3, 3, 3]);
  });
});

describe('countResidentsByBuilding', () => {
  test('returns an empty array for no transactions', () => {
    expect(countResidentsByBuilding([])).toEqual([]);
  });

  test('counts distinct residents per building and sorts descending', () => {
    const transactions = [
      makeTransaction({
        building_code: 'A',
        building_name: 'Building A',
        resident_id: 10,
      }),
      makeTransaction({
        building_code: 'A',
        building_name: 'Building A',
        resident_id: 10,
      }),
      makeTransaction({
        building_code: 'A',
        building_name: 'Building A',
        resident_id: 11,
      }),
      makeTransaction({
        building_code: 'B',
        building_name: 'Building B',
        resident_id: 20,
      }),
    ];
    const result = countResidentsByBuilding(transactions);
    expect(result).toEqual([
      {
        building_code: 'A',
        building_name: 'Building A',
        residentCount: 2,
        visitCount: 3,
      },
      {
        building_code: 'B',
        building_name: 'Building B',
        residentCount: 1,
        visitCount: 1,
      },
    ]);
  });

  test('reports visitCount separately from residentCount for a repeat visitor', () => {
    const transactions = [
      makeTransaction({
        building_code: 'A',
        building_name: 'Building A',
        resident_id: 10,
      }),
      makeTransaction({
        building_code: 'A',
        building_name: 'Building A',
        resident_id: 10,
      }),
    ];
    const result = countResidentsByBuilding(transactions);
    expect(result).toEqual([
      {
        building_code: 'A',
        building_name: 'Building A',
        residentCount: 1,
        visitCount: 2,
      },
    ]);
  });
});

describe('topItemsAdded', () => {
  const makeAdd = (
    overrides: Partial<InventoryTransaction>,
  ): InventoryTransaction => ({
    transaction_id: 'inv-1',
    user_id: 1,
    transaction_type: TransactionType.InventoryAdd,
    transaction_date: '2026-01-01T00:00:00Z',
    item_name: 'Item A',
    category_name: 'Category A',
    quantity: 1,
    ...overrides,
  });

  test('sums quantity per item and ranks highest first', () => {
    const result = topItemsAdded(
      [
        makeAdd({ transaction_id: 'a', item_name: 'Soap', quantity: 5 }),
        makeAdd({ transaction_id: 'b', item_name: 'Towels', quantity: 12 }),
        makeAdd({ transaction_id: 'c', item_name: 'Soap', quantity: 3 }),
      ],
      10,
    );
    expect(result).toEqual([
      { item_name: 'Towels', total_quantity: 12 },
      { item_name: 'Soap', total_quantity: 8 },
    ]);
  });

  test('caps the list at the given limit', () => {
    const result = topItemsAdded(
      [
        makeAdd({ transaction_id: 'a', item_name: 'A', quantity: 3 }),
        makeAdd({ transaction_id: 'b', item_name: 'B', quantity: 2 }),
        makeAdd({ transaction_id: 'c', item_name: 'C', quantity: 1 }),
      ],
      2,
    );
    expect(result.map((r) => r.item_name)).toEqual(['A', 'B']);
  });
});

describe('sumItemsAdded', () => {
  const makeAdd = (
    overrides: Partial<InventoryTransaction>,
  ): InventoryTransaction => ({
    transaction_id: 'inv-1',
    user_id: 1,
    transaction_type: TransactionType.InventoryAdd,
    transaction_date: '2026-01-01T00:00:00Z',
    item_name: 'Item A',
    category_name: 'Category A',
    quantity: 1,
    ...overrides,
  });

  test('totals the quantity across every transaction', () => {
    expect(
      sumItemsAdded([
        makeAdd({ transaction_id: 'a', quantity: 5 }),
        makeAdd({ transaction_id: 'b', quantity: 12 }),
        makeAdd({ transaction_id: 'c', quantity: 3 }),
      ]),
    ).toBe(20);
  });

  test('returns 0 for an empty range', () => {
    expect(sumItemsAdded([])).toBe(0);
  });
});

describe('percentChange', () => {
  test('returns null when previous is 0', () => {
    expect(percentChange(10, 0)).toBeNull();
  });

  test('returns the rounded percent increase', () => {
    expect(percentChange(15, 10)).toBe(50);
  });

  test('returns the rounded percent decrease', () => {
    expect(percentChange(5, 10)).toBe(-50);
  });
});

describe('previousPeriod', () => {
  test('returns an equal-length window ending immediately before startDate', () => {
    const result = previousPeriod(
      '2025-02-01T00:00:00.000Z',
      '2025-02-28T23:59:59.999Z',
    );
    expect(result.endDate).toBe('2025-01-31T23:59:59.999Z');
    expect(result.startDate).toBe('2025-01-04T00:00:00.000Z');
  });

  test('returns a single-day window for a single-day range', () => {
    const result = previousPeriod(
      '2025-01-02T00:00:00.000Z',
      '2025-01-02T23:59:59.999Z',
    );
    expect(result.startDate).toBe('2025-01-01T00:00:00.000Z');
    expect(result.endDate).toBe('2025-01-01T23:59:59.999Z');
  });
});

describe('sortLowStockItems', () => {
  test('excludes items above their threshold', () => {
    const items = [
      makeItem({ id: 1, quantity: 10, threshold: 5 }),
      makeItem({ id: 2, quantity: 5, threshold: 5 }),
    ];
    expect(sortLowStockItems(items).map((item) => item.id)).toEqual([2]);
  });

  test('sorts Out of Stock items before Low Stock items', () => {
    const items = [
      makeItem({
        id: 1,
        name: 'B',
        quantity: 3,
        threshold: 5,
        status: 'Low Stock',
      }),
      makeItem({
        id: 2,
        name: 'A',
        quantity: 0,
        threshold: 5,
        status: 'Out of Stock',
      }),
    ];
    expect(sortLowStockItems(items).map((item) => item.id)).toEqual([2, 1]);
  });

  test('sorts Needs Review items before Out of Stock items', () => {
    const items = [
      makeItem({
        id: 1,
        name: 'A',
        quantity: 0,
        threshold: 5,
        status: 'Out of Stock',
      }),
      makeItem({
        id: 2,
        name: 'B',
        quantity: -2,
        threshold: 5,
        status: 'Needs Review',
      }),
    ];
    expect(sortLowStockItems(items).map((item) => item.id)).toEqual([2, 1]);
  });

  test('within the same status, sorts by ascending quantity-minus-threshold', () => {
    const items = [
      makeItem({ id: 1, name: 'A', quantity: 1, threshold: 5 }),
      makeItem({ id: 2, name: 'B', quantity: 4, threshold: 5 }),
    ];
    expect(sortLowStockItems(items).map((item) => item.id)).toEqual([1, 2]);
  });

  test('falls back to alphabetical order for equal deltas', () => {
    const items = [
      makeItem({ id: 1, name: 'Zebra', quantity: 4, threshold: 5 }),
      makeItem({ id: 2, name: 'Apple', quantity: 4, threshold: 5 }),
    ];
    expect(sortLowStockItems(items).map((item) => item.name)).toEqual([
      'Apple',
      'Zebra',
    ]);
  });

  test('does not mutate the original array', () => {
    const items = [
      makeItem({ id: 1, name: 'B', quantity: 4, threshold: 5 }),
      makeItem({ id: 2, name: 'A', quantity: 4, threshold: 5 }),
    ];
    const original = [...items];
    sortLowStockItems(items);
    expect(items).toEqual(original);
  });
});

describe('formatTransactionDate', () => {
  test('formats an ISO date as "Mon D, YYYY"', () => {
    expect(formatTransactionDate('2026-08-12T12:00:00.000Z')).toBe(
      'Aug 12, 2026',
    );
  });
});
