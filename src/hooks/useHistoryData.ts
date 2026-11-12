/**
 *  useHistoryData.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useEffect, useMemo } from 'react';
import type { ClientPrincipal, CheckoutTransaction, InventoryTransaction } from '../types/interfaces';
import {
  getCheckoutHistory,
  getInventoryHistory,
} from '../services/historyService';
import { processTransactionsByUser } from '../components/History/transactionProcessors';

interface UseHistoryDataProps {
  user: ClientPrincipal | null;
  formattedDateRange: {
    startDate: string;
    endDate: string;
  };
  historyType: 'checkout' | 'inventory';
  loggedInUserId: number | null;
  selectedBuildingId: number | 'all';
  onError: (message: string) => void;
}

export function useHistoryData({
  user,
  formattedDateRange,
  historyType,
  loggedInUserId,
  selectedBuildingId,
  onError,
}: UseHistoryDataProps) {
  const [userHistory, setUserHistory] = useState<
    CheckoutTransaction[] | InventoryTransaction[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function findUserHistoryForSelectedDate() {
      try {
        setIsLoading(true);
        const response =
          historyType === 'checkout'
            ? await getCheckoutHistory(
                user,
                formattedDateRange.startDate,
                formattedDateRange.endDate,
              )
            : await getInventoryHistory(
                user,
                formattedDateRange.startDate,
                formattedDateRange.endDate,
              );
        if (mounted) setUserHistory(response);
      } catch (error) {
        if (mounted) onError('Error fetching history: ' + error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    findUserHistoryForSelectedDate();
    return () => {
      mounted = false;
    };
  }, [formattedDateRange, historyType, user, onError]);

  const filteredUserHistory = useMemo(() => {
    if (historyType === 'checkout' && selectedBuildingId !== 'all') {
      return (userHistory as CheckoutTransaction[] | null)?.filter(
        (transaction) => transaction.building_id === selectedBuildingId,
      ) ?? [];
    }
    return userHistory ?? [];
  }, [userHistory, historyType, selectedBuildingId]);

  const transactionsByUser = useMemo(
    () => processTransactionsByUser(filteredUserHistory, loggedInUserId ?? 0),
    [filteredUserHistory, loggedInUserId],
  );

  return {
    userHistory,
    transactionsByUser,
    isLoading,
  };
}
