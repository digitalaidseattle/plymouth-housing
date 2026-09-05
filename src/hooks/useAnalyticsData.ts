/**
 *  useAnalyticsData.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
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
import { cacheGet, cacheRemove, cacheSet } from '../utils/sessionCache';
import { SETTINGS } from '../types/constants';

// Separate slots, so a building change only refetches the item totals.
// Buildings aren't here: getBuildings keeps its own longer-lived cache.
const CACHE_KEYS = {
  range: 'analyticsRange',
  itemTotals: 'analyticsItemTotals',
  items: 'analyticsItems',
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

  // Buildings rarely change, so getBuildings' own cache is the only one, and
  // Refresh leaves it alone. Fetched once per user, not per reload.
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    setBuildingsLoading(true);
    getBuildings(user)
      .then((result) => {
        if (mounted) setBuildings(result);
      })
      .catch((error) => {
        if (mounted) onError(`Error fetching buildings: ${error}`);
      })
      .finally(() => {
        if (mounted) setBuildingsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user, onError]);

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
    buildings,
    isLoading:
      range.isLoading ||
      itemTotals.isLoading ||
      items.isLoading ||
      buildingsLoading,
    lastUpdated,
    refresh,
  };
}

// This hook is the only caller, so the caching machinery lives here rather
// than in a shared hook of its own.
interface Entry<T> {
  variant: string;
  fetchedAt: number;
  data: T;
}

interface CachedFetchOptions<T> {
  cacheKey: string;
  // Everything the fetcher reads. The only refetch trigger, so anything the
  // fetcher depends on has to appear here.
  variant: string;
  ttl: number;
  initial: T;
  fetcher: () => Promise<T>;
  errorLabel: string;
  onError: (message: string) => void;
  reloadToken: number;
}

function useCachedFetch<T>({
  cacheKey,
  variant,
  ttl,
  initial,
  fetcher,
  errorLabel,
  onError,
  reloadToken,
}: CachedFetchOptions<T>) {
  const [data, setData] = useState<T>(initial);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ref'd so the effect depends only on primitives and inline arrows are safe.
  const latest = useRef({ fetcher, onError, initial });
  useLayoutEffect(() => {
    latest.current = { fetcher, onError, initial };
  });

  useEffect(() => {
    const cached = cacheGet<Entry<T>>(cacheKey, ttl);
    if (cached && cached.variant === variant) {
      setData(cached.data);
      setFetchedAt(cached.fetchedAt);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    latest.current
      .fetcher()
      .then((result) => {
        if (!mounted) return;
        const fetchedAt = Date.now();
        setData(result);
        setFetchedAt(fetchedAt);
        cacheSet<Entry<T>>(cacheKey, { variant, fetchedAt, data: result });
      })
      .catch((error) => {
        if (!mounted) return;
        // Cleared, so one range's numbers never sit under another's heading.
        setData(latest.current.initial);
        setFetchedAt(null);
        latest.current.onError(`${errorLabel}: ${message(error)}`);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [cacheKey, variant, ttl, errorLabel, reloadToken]);

  return { data, fetchedAt, isLoading };
}

const message = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// Names the failing request when several are awaited together.
const labelled = <T>(label: string, request: Promise<T>): Promise<T> =>
  request.catch((error) => {
    throw new Error(`${label} (${message(error)})`);
  });
