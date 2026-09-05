/**
 *  useAnalyticsData.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAnalyticsData } from './useAnalyticsData';
import {
  getCheckoutHistory,
  getInventoryHistory,
} from '../services/historyService';
import { getCheckoutItemTotals } from '../services/analyticsService';
import { getItems } from '../services/itemsService';
import { getBuildings } from '../services/residentService';
import { previousPeriod } from '../utils/analyticsUtils';
import { TransactionType } from '../types/interfaces';
import type {
  Building,
  CheckoutItemTotal,
  CheckoutTransaction,
  ClientPrincipal,
  InventoryItem,
  InventoryTransaction,
} from '../types/interfaces';

vi.mock('../services/historyService');
vi.mock('../services/analyticsService');
vi.mock('../services/itemsService');
vi.mock('../services/residentService');

const USER: ClientPrincipal = {
  userId: '1',
  userDetails: 'Test User',
  userRoles: ['admin'],
};

const RANGE = {
  startDate: '2026-03-01T00:00:00.000Z',
  endDate: '2026-03-31T23:59:59.999Z',
};
const PREVIOUS = previousPeriod(RANGE.startDate, RANGE.endDate);

const checkout = (
  transaction_id: string,
  building_id: number,
): CheckoutTransaction => ({
  building_id,
  building_code: `B${building_id}`,
  building_name: `Building ${building_id}`,
  item_type: 'general',
  resident_id: 1,
  resident_name: 'Alice',
  transaction_date: '2026-03-02T00:00:00.000Z',
  transaction_id,
  unit_number: '101',
  user_id: 7,
  welcome_basket_item_id: null,
  welcome_basket_quantity: null,
  total_quantity: 1,
  is_edited: false,
});

const inventory = (
  transaction_id: string,
  transaction_type: InventoryTransaction['transaction_type'],
): InventoryTransaction => ({
  category_name: 'Kitchen',
  item_name: 'Mug',
  quantity: 5,
  transaction_date: '2026-03-02T00:00:00.000Z',
  transaction_id,
  transaction_type,
  user_id: 7,
});

const CURRENT_ROWS = [checkout('c1', 1), checkout('c2', 2)];
const PREVIOUS_ROWS = [checkout('p1', 1), checkout('p2', 2)];
const CURRENT_INVENTORY = [
  inventory('i1', TransactionType.InventoryAdd),
  inventory('i2', TransactionType.InventoryReplaceValue),
];
const PREVIOUS_INVENTORY = [inventory('i3', TransactionType.InventoryAdd)];
const ITEM_TOTALS: CheckoutItemTotal[] = [
  { item_id: 1, item_name: 'Mug', total_quantity: 4, checkout_count: 2 },
];
const ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: 'Mug',
    type: 'general',
    description: '',
    quantity: 2,
    threshold: 5,
    category: 'Kitchen',
    status: 'Low',
  },
];
const BUILDINGS: Building[] = [
  { id: 1, name: 'Building 1', code: 'B1' },
  { id: 2, name: 'Building 2', code: 'B2' },
];

const onError = vi.fn();

const render = (buildingId: number | null = null) =>
  renderHook(
    ({ building }: { building: number | null }) =>
      useAnalyticsData({
        user: USER,
        formattedDateRange: RANGE,
        buildingId: building,
        onError,
      }),
    { initialProps: { building: buildingId } },
  );

describe('useAnalyticsData', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.mocked(getCheckoutHistory).mockImplementation((_user, startDate) =>
      Promise.resolve(
        startDate === RANGE.startDate ? CURRENT_ROWS : PREVIOUS_ROWS,
      ),
    );
    vi.mocked(getInventoryHistory).mockImplementation((_user, startDate) =>
      Promise.resolve(
        startDate === RANGE.startDate ? CURRENT_INVENTORY : PREVIOUS_INVENTORY,
      ),
    );
    vi.mocked(getCheckoutItemTotals).mockResolvedValue(ITEM_TOTALS);
    vi.mocked(getItems).mockResolvedValue(ITEMS);
    vi.mocked(getBuildings).mockResolvedValue(BUILDINGS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('loads every slice and stops loading', async () => {
    const { result } = render();

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currentRows).toEqual(CURRENT_ROWS);
    expect(result.current.previousRows).toEqual(PREVIOUS_ROWS);
    expect(result.current.itemTotals).toEqual(ITEM_TOTALS);
    expect(result.current.items).toEqual(ITEMS);
    expect(result.current.buildings).toEqual(BUILDINGS);
    expect(result.current.lastUpdated).not.toBeNull();
  });

  test('fetches the matching previous period', async () => {
    const { result } = render();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.previousRange).toEqual(PREVIOUS);
    expect(getCheckoutHistory).toHaveBeenCalledWith(
      USER,
      PREVIOUS.startDate,
      PREVIOUS.endDate,
    );
    expect(getInventoryHistory).toHaveBeenCalledWith(
      USER,
      PREVIOUS.startDate,
      PREVIOUS.endDate,
    );
  });

  // Value corrections are in the same feed and would double-count as stock in.
  test('keeps only the inventory adds', async () => {
    const { result } = render();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.inventoryAdds).toEqual([CURRENT_INVENTORY[0]]);
    expect(result.current.previousInventoryAdds).toEqual(PREVIOUS_INVENTORY);
  });

  test('filters the rows by building without refetching them', async () => {
    const { result, rerender } = render();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getCheckoutHistory).toHaveBeenCalledTimes(2);

    rerender({ building: 2 });
    await waitFor(() =>
      expect(result.current.currentRows).toEqual([CURRENT_ROWS[1]]),
    );
    expect(result.current.previousRows).toEqual([PREVIOUS_ROWS[1]]);
    expect(getCheckoutHistory).toHaveBeenCalledTimes(2);
  });

  // The totals are aggregated in SQL, so this filter has to go to the server.
  test('refetches the item totals when the building changes', async () => {
    const { result, rerender } = render();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ building: 2 });
    await waitFor(() =>
      expect(getCheckoutItemTotals).toHaveBeenCalledWith(
        USER,
        RANGE.startDate,
        RANGE.endDate,
        2,
      ),
    );
  });

  test('reports the oldest fetch time, not the newest', async () => {
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    // Held open so the items land first and the range gets the later stamp.
    const held: Array<() => void> = [];
    vi.mocked(getCheckoutHistory).mockImplementation(
      () =>
        new Promise((resolve) => {
          held.push(() => resolve(CURRENT_ROWS));
        }),
    );

    const { result } = render();
    await waitFor(() => expect(result.current.items).toEqual(ITEMS));

    now = 5000;
    await act(async () => {
      held.forEach((release) => release());
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lastUpdated).toBe(1000);
  });

  test('refresh refetches the analytics data but leaves the buildings', async () => {
    const { result } = render();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.refresh();
    });
    await waitFor(() => expect(getCheckoutHistory).toHaveBeenCalledTimes(4));

    expect(getCheckoutItemTotals).toHaveBeenCalledTimes(2);
    expect(getItems).toHaveBeenCalledTimes(2);
    expect(getBuildings).toHaveBeenCalledTimes(1);
  });

  test('names the failing request when a fetch fails', async () => {
    vi.mocked(getCheckoutHistory).mockRejectedValue(new Error('down'));

    const { result } = render();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(onError).toHaveBeenCalledWith(
      'Error fetching analytics data: checkouts (down)',
    );
    expect(result.current.currentRows).toEqual([]);
    expect(result.current.previousRows).toEqual([]);
    expect(sessionStorage.getItem('analyticsRange')).toBeNull();
  });

  test('reports a buildings failure separately', async () => {
    vi.mocked(getBuildings).mockRejectedValue(new Error('down'));

    const { result } = render();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(onError).toHaveBeenCalledWith(
      'Error fetching buildings: Error: down',
    );
    expect(result.current.buildings).toEqual([]);
  });
});
