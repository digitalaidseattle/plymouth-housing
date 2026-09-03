/**
 *  useAnalyticsData.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useEffect, useMemo } from 'react';
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

  useEffect(() => {
    let mounted = true;

    async function fetchAnalyticsData() {
      try {
        setIsLoading(true);
        const { startDate, endDate } = formattedDateRange;
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
          onError('Error fetching checkout history: ' + previousResult.reason);
        }
        if (itemTotalsResult.status === 'fulfilled') {
          setItemTotals(itemTotalsResult.value);
        } else {
          onError(
            'Error fetching checkout item totals: ' + itemTotalsResult.reason,
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchAnalyticsData();
    return () => {
      mounted = false;
    };
  }, [formattedDateRange, buildingId, user, onError]);

  useEffect(() => {
    let mounted = true;

    async function fetchStaticData() {
      const [itemsResult, buildingsResult] = await Promise.allSettled([
        getItems(user),
        getBuildings(user),
      ]);
      if (!mounted) return;

      if (itemsResult.status === 'fulfilled') {
        setItems(itemsResult.value);
      } else {
        onError('Error fetching items: ' + itemsResult.reason);
      }
      if (buildingsResult.status === 'fulfilled') {
        setBuildings(buildingsResult.value);
      } else {
        onError('Error fetching buildings: ' + buildingsResult.reason);
      }
    }
    fetchStaticData();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  return {
    currentRows,
    previousRows,
    itemTotals,
    items,
    buildings,
    isLoading,
  };
}
