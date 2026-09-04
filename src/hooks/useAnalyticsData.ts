/**
 *  useAnalyticsData.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useMemo, useCallback } from 'react';
import type {
  ClientPrincipal,
  CheckoutTransaction,
  CheckoutItemTotal,
  InventoryItem,
  InventoryTransaction,
  Building,
  DateRangeStrings,
} from '../types/interfaces';
import { TransactionType } from '../types/interfaces';
import {
  getCheckoutHistory,
  getInventoryHistory,
} from '../services/historyService';
import { getCheckoutItemTotals } from '../services/analyticsService';
import { getItems } from '../services/itemsService';
import { getBuildings } from '../services/residentService';
import { previousPeriod } from '../utils/analyticsUtils';
import { cacheRemove } from '../utils/sessionCache';
import { useCachedFetch, labelled } from './useCachedFetch';
import { SETTINGS } from '../types/constants';

// Separate slots, so a building change only refetches the item totals.
const CACHE_KEYS = {
  range: 'analyticsRange',
  itemTotals: 'analyticsItemTotals',
  items: 'analyticsItems',
  buildings: 'analyticsBuildings',
};

const TTL = SETTINGS.analytics_cache_ttl;

interface RangeData {
  currentRows: CheckoutTransaction[];
  previousRows: CheckoutTransaction[];
  inventoryAdds: InventoryTransaction[];
  previousInventoryAdds: InventoryTransaction[];
}

const NO_RANGE_DATA: RangeData = {
  currentRows: [],
  previousRows: [],
  inventoryAdds: [],
  previousInventoryAdds: [],
};

// Inventory history also carries value corrections; only adds are stock in.
const onlyAdds = (rows: InventoryTransaction[]): InventoryTransaction[] =>
  rows.filter((t) => t.transaction_type === TransactionType.InventoryAdd);

const fetchRangeData = async (
  user: ClientPrincipal | null,
  current: DateRangeStrings,
  previous: DateRangeStrings,
): Promise<RangeData> => {
  const [currentRows, previousRows, inventory, previousInventory] =
    await Promise.all([
      labelled(
        'checkouts',
        getCheckoutHistory(user, current.startDate, current.endDate),
      ),
      labelled(
        'previous period checkouts',
        getCheckoutHistory(user, previous.startDate, previous.endDate),
      ),
      labelled(
        'inventory',
        getInventoryHistory(user, current.startDate, current.endDate),
      ),
      labelled(
        'previous period inventory',
        getInventoryHistory(user, previous.startDate, previous.endDate),
      ),
    ]);
  return {
    currentRows,
    previousRows,
    inventoryAdds: onlyAdds(inventory),
    previousInventoryAdds: onlyAdds(previousInventory),
  };
};

interface UseAnalyticsDataProps {
  user: ClientPrincipal | null;
  formattedDateRange: DateRangeStrings;
  buildingId: number | null;
  onError: (message: string) => void;
}

export function useAnalyticsData({
  user,
  formattedDateRange,
  buildingId,
  onError,
}: UseAnalyticsDataProps) {
  const [reloadToken, setReloadToken] = useState(0);
  const { startDate, endDate } = formattedDateRange;
  const userId = user?.userId ?? 'anonymous';

  const previousRange = useMemo(
    () => previousPeriod(startDate, endDate),
    [startDate, endDate],
  );

  const refresh = useCallback(() => {
    Object.values(CACHE_KEYS).forEach(cacheRemove);
    setReloadToken((token) => token + 1);
  }, []);

  const range = useCachedFetch({
    cacheKey: CACHE_KEYS.range,
    variant: `${userId}|${startDate}|${endDate}`,
    ttl: TTL,
    initial: NO_RANGE_DATA,
    fetcher: () => fetchRangeData(user, formattedDateRange, previousRange),
    errorLabel: 'Error fetching analytics data',
    onError,
    reloadToken,
  });

  // Aggregated in SQL, so the building filter has to go to the server.
  const itemTotals = useCachedFetch({
    cacheKey: CACHE_KEYS.itemTotals,
    variant: `${userId}|${startDate}|${endDate}|${buildingId ?? 'all'}`,
    ttl: TTL,
    initial: [] as CheckoutItemTotal[],
    fetcher: () => getCheckoutItemTotals(user, startDate, endDate, buildingId),
    errorLabel: 'Error fetching checkout item totals',
    onError,
    reloadToken,
  });

  // Neither of these moves with the filters.
  const items = useCachedFetch({
    cacheKey: CACHE_KEYS.items,
    variant: userId,
    ttl: TTL,
    initial: [] as InventoryItem[],
    fetcher: () => getItems(user),
    errorLabel: 'Error fetching items',
    onError,
    reloadToken,
  });

  const buildings = useCachedFetch({
    cacheKey: CACHE_KEYS.buildings,
    variant: userId,
    ttl: TTL,
    initial: [] as Building[],
    fetcher: () => getBuildings(user),
    errorLabel: 'Error fetching buildings',
    onError,
    reloadToken,
  });

  const { currentRows: allCurrentRows, previousRows: allPreviousRows } =
    range.data;
  const currentRows = useMemo(
    () =>
      buildingId === null
        ? allCurrentRows
        : allCurrentRows.filter((row) => row.building_id === buildingId),
    [allCurrentRows, buildingId],
  );
  const previousRows = useMemo(
    () =>
      buildingId === null
        ? allPreviousRows
        : allPreviousRows.filter((row) => row.building_id === buildingId),
    [allPreviousRows, buildingId],
  );

  // Oldest, not newest, so the label never overstates freshness.
  const lastUpdated = useMemo(() => {
    const stamps = [range.fetchedAt, items.fetchedAt].filter(
      (stamp): stamp is number => stamp !== null,
    );
    return stamps.length > 0 ? Math.min(...stamps) : null;
  }, [range.fetchedAt, items.fetchedAt]);

  return {
    currentRows,
    previousRows,
    previousRange,
    itemTotals: itemTotals.data,
    inventoryAdds: range.data.inventoryAdds,
    previousInventoryAdds: range.data.previousInventoryAdds,
    items: items.data,
    buildings: buildings.data,
    isLoading: range.isLoading || itemTotals.isLoading,
    lastUpdated,
    refresh,
  };
}
