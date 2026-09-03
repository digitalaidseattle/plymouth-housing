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
  Building,
} from '../types/interfaces';
import { getCheckoutHistory } from '../services/historyService';
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

interface CheckoutsCache {
  key: string;
  currentRows: CheckoutTransaction[];
  previousRows: CheckoutTransaction[];
  itemTotals: CheckoutItemTotal[];
  fetchedAt: number;
}

interface ItemsCache {
  items: InventoryItem[];
  fetchedAt: number;
}

const isFresh = (fetchedAt: number): boolean =>
  Date.now() - fetchedAt < SETTINGS.analytics_cache_ttl;

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
  const [currentRowsRaw, setCurrentRowsRaw] = useState<CheckoutTransaction[]>(
    [],
  );
  const [previousRowsRaw, setPreviousRowsRaw] = useState<CheckoutTransaction[]>(
    [],
  );
  const [itemTotals, setItemTotals] = useState<CheckoutItemTotal[]>([]);
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

    if (cached && cached.key === cacheKey && isFresh(cached.fetchedAt)) {
      setCurrentRowsRaw(cached.currentRows);
      setPreviousRowsRaw(cached.previousRows);
      setItemTotals(cached.itemTotals);
      setCheckoutsFetchedAt(cached.fetchedAt);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function fetchAnalyticsData() {
      try {
        setIsLoading(true);
        const previous = previousPeriod(startDate, endDate);
        const [currentResult, previousResult, itemTotalsResult] =
          await Promise.allSettled([
            getCheckoutHistory(user, startDate, endDate),
            getCheckoutHistory(user, previous.startDate, previous.endDate),
            getCheckoutItemTotals(user, startDate, endDate, buildingId),
          ]);
        if (!mounted) return;

        if (currentResult.status === 'fulfilled') {
          setCurrentRowsRaw(currentResult.value);
        } else {
          onError('Error fetching checkout history: ' + currentResult.reason);
        }
        if (previousResult.status === 'fulfilled') {
          setPreviousRowsRaw(previousResult.value);
        } else {
          onError(
            'Error fetching the previous period for comparison: ' +
              previousResult.reason,
          );
        }
        if (itemTotalsResult.status === 'fulfilled') {
          setItemTotals(itemTotalsResult.value);
        } else {
          onError(
            'Error fetching checkout item totals: ' + itemTotalsResult.reason,
          );
        }

        const fetchedAt = Date.now();
        setCheckoutsFetchedAt(fetchedAt);
        // Only a complete result is worth caching; a partial one would hide the
        // failed call behind stale numbers until the cache expires.
        if (
          currentResult.status === 'fulfilled' &&
          previousResult.status === 'fulfilled' &&
          itemTotalsResult.status === 'fulfilled'
        ) {
          cacheSet<CheckoutsCache>(CHECKOUTS_CACHE_KEY, {
            key: cacheKey,
            currentRows: currentResult.value,
            previousRows: previousResult.value,
            itemTotals: itemTotalsResult.value,
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

  const currentRows = useMemo(
    () =>
      buildingId === null
        ? currentRowsRaw
        : currentRowsRaw.filter((row) => row.building_id === buildingId),
    [currentRowsRaw, buildingId],
  );
  const previousRows = useMemo(
    () =>
      buildingId === null
        ? previousRowsRaw
        : previousRowsRaw.filter((row) => row.building_id === buildingId),
    [previousRowsRaw, buildingId],
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
    itemTotals,
    items,
    buildings,
    isLoading,
    lastUpdated,
    refresh,
  };
}
