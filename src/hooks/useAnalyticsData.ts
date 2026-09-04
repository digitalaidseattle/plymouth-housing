/**
 *  useAnalyticsData.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  ClientPrincipal,
  CheckoutTransaction,
  CheckoutItemTotal,
  InventoryItem,
  InventoryTransaction,
  Building,
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
import { cacheGet, cacheRemove, cacheSet } from '../utils/sessionCache';
import { SETTINGS } from '../types/constants';

// Landing on the admin home refetches everything, so the results are held in
// session storage for a few minutes. Refresh clears them for an instant reload.
const CHECKOUTS_CACHE_KEY = 'analyticsCheckouts';
const ITEMS_CACHE_KEY = 'analyticsItems';

interface CheckoutsData {
  currentRows: CheckoutTransaction[];
  previousRows: CheckoutTransaction[];
  itemTotals: CheckoutItemTotal[];
  inventoryAdds: InventoryTransaction[];
  previousInventoryAdds: InventoryTransaction[];
}

interface CheckoutsCache extends CheckoutsData {
  key: string;
  fetchedAt: number;
}

const NO_CHECKOUTS: CheckoutsData = {
  currentRows: [],
  previousRows: [],
  itemTotals: [],
  inventoryAdds: [],
  previousInventoryAdds: [],
};

interface ItemsCache {
  items: InventoryItem[];
  fetchedAt: number;
}

const isFresh = (fetchedAt: number): boolean =>
  Date.now() - fetchedAt < SETTINGS.analytics_cache_ttl;

// Inventory history covers adds and value corrections; only the adds count as
// stock coming in.
const onlyAdds = (rows: InventoryTransaction[]): InventoryTransaction[] =>
  rows.filter((t) => t.transaction_type === TransactionType.InventoryAdd);

interface UseAnalyticsDataProps {
  user: ClientPrincipal | null;
  formattedDateRange: {
    startDate: string;
    endDate: string;
  };
  buildingId: number | null;
  onError: (message: string) => void;
}

export function useAnalyticsData({
  user,
  formattedDateRange,
  buildingId,
  onError,
}: UseAnalyticsDataProps) {
  const [checkouts, setCheckouts] = useState<CheckoutsData>(NO_CHECKOUTS);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutsFetchedAt, setCheckoutsFetchedAt] = useState<number | null>(
    null,
  );
  const [itemsFetchedAt, setItemsFetchedAt] = useState<number | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    cacheRemove(CHECKOUTS_CACHE_KEY);
    cacheRemove(ITEMS_CACHE_KEY);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const { startDate, endDate } = formattedDateRange;
    const cacheKey = `${startDate}|${endDate}|${buildingId ?? 'all'}`;
    const cached = cacheGet<CheckoutsCache>(CHECKOUTS_CACHE_KEY);

    // Array.isArray guards against a cache entry written by an older build that
    // predates a field; a missing shape falls through to a fresh fetch.
    if (
      cached &&
      cached.key === cacheKey &&
      isFresh(cached.fetchedAt) &&
      Array.isArray(cached.inventoryAdds) &&
      Array.isArray(cached.previousInventoryAdds)
    ) {
      setCheckouts(cached);
      setCheckoutsFetchedAt(cached.fetchedAt);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function fetchAnalyticsData() {
      try {
        setIsLoading(true);
        const previous = previousPeriod(startDate, endDate);
        const [
          currentResult,
          previousResult,
          itemTotalsResult,
          inventoryResult,
          previousInventoryResult,
        ] = await Promise.allSettled([
          getCheckoutHistory(user, startDate, endDate),
          getCheckoutHistory(user, previous.startDate, previous.endDate),
          getCheckoutItemTotals(user, startDate, endDate, buildingId),
          getInventoryHistory(user, startDate, endDate),
          getInventoryHistory(user, previous.startDate, previous.endDate),
        ]);
        if (!mounted) return;

        // A failed call reports itself and contributes nothing, so the page
        // never shows one range's numbers beside another's.
        let complete = true;
        const settle = <T>(
          result: PromiseSettledResult<T[]>,
          label: string,
        ): T[] => {
          if (result.status === 'fulfilled') return result.value;
          complete = false;
          onError(`${label}: ${result.reason}`);
          return [];
        };

        const data: CheckoutsData = {
          currentRows: settle(currentResult, 'Error fetching checkout history'),
          previousRows: settle(
            previousResult,
            'Error fetching the previous period for comparison',
          ),
          itemTotals: settle(
            itemTotalsResult,
            'Error fetching checkout item totals',
          ),
          inventoryAdds: onlyAdds(
            settle(inventoryResult, 'Error fetching inventory history'),
          ),
          previousInventoryAdds: onlyAdds(
            settle(
              previousInventoryResult,
              'Error fetching the previous period inventory history',
            ),
          ),
        };

        const fetchedAt = Date.now();
        setCheckouts(data);
        setCheckoutsFetchedAt(fetchedAt);
        // Only a complete result is worth caching; a partial one would hide the
        // failed call behind stale numbers until the cache expires.
        if (complete) {
          cacheSet<CheckoutsCache>(CHECKOUTS_CACHE_KEY, {
            key: cacheKey,
            ...data,
            fetchedAt,
          });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchAnalyticsData();
    return () => {
      mounted = false;
    };
  }, [formattedDateRange, buildingId, user, onError, reloadToken]);

  useEffect(() => {
    const cached = cacheGet<ItemsCache>(ITEMS_CACHE_KEY);
    if (cached && isFresh(cached.fetchedAt)) {
      setItems(cached.items);
      setItemsFetchedAt(cached.fetchedAt);
      return;
    }

    let mounted = true;

    async function fetchItems() {
      try {
        const result = await getItems(user);
        if (!mounted) return;
        const fetchedAt = Date.now();
        setItems(result);
        setItemsFetchedAt(fetchedAt);
        cacheSet<ItemsCache>(ITEMS_CACHE_KEY, { items: result, fetchedAt });
      } catch (error) {
        if (mounted) onError('Error fetching items: ' + error);
      }
    }
    fetchItems();
    return () => {
      mounted = false;
    };
  }, [user, onError, reloadToken]);

  // getBuildings has its own session cache, so this stays a plain fetch.
  useEffect(() => {
    let mounted = true;

    async function fetchBuildings() {
      try {
        const result = await getBuildings(user);
        if (mounted) setBuildings(result);
      } catch (error) {
        if (mounted) onError('Error fetching buildings: ' + error);
      }
    }
    fetchBuildings();
    return () => {
      mounted = false;
    };
  }, [user, onError, reloadToken]);

  const { currentRows: allCurrentRows, previousRows: allPreviousRows } =
    checkouts;
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

  // The oldest of the two fetches, so the label never claims data is newer
  // than the stalest panel on the page.
  const lastUpdated = useMemo(() => {
    const stamps = [checkoutsFetchedAt, itemsFetchedAt].filter(
      (stamp): stamp is number => stamp !== null,
    );
    return stamps.length > 0 ? Math.min(...stamps) : null;
  }, [checkoutsFetchedAt, itemsFetchedAt]);

  return {
    currentRows,
    previousRows,
    itemTotals: checkouts.itemTotals,
    inventoryAdds: checkouts.inventoryAdds,
    previousInventoryAdds: checkouts.previousInventoryAdds,
    items,
    buildings,
    isLoading,
    lastUpdated,
    refresh,
  };
}
