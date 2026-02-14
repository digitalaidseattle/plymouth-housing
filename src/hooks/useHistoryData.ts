import { useState, useEffect, useMemo } from 'react';
import type { ClientPrincipal, CategoryProps } from '../types/interfaces';
import { CheckoutTransaction, InventoryTransaction } from '../types/history';
import {
  getCheckoutHistory,
  getInventoryHistory,
} from '../components/History/HistoryAPICalls';
import { processTransactionsByUser } from '../components/History/transactionProcessors';

interface UseHistoryDataProps {
  user: ClientPrincipal | null;
  formattedDateRange: {
    startDate: string;
    endDate: string;
  };
  historyType: 'checkout' | 'inventory';
  categorizedItems: CategoryProps[];
  loggedInUserId: number | null;
  onError: (message: string) => void;
}

export function useHistoryData({
  user,
  formattedDateRange,
  historyType,
  categorizedItems,
  loggedInUserId,
  onError,
}: UseHistoryDataProps) {
  const [userHistory, setUserHistory] = useState<
    CheckoutTransaction[] | InventoryTransaction[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function findUserHistoryForSelectedDate() {
      try {
        setIsLoading(true);
        const response =
          historyType === 'checkout'
            ? await getCheckoutHistory(
                user,
                formattedDateRange.startDate,
                formattedDateRange.endDate,
                categorizedItems,
              )
            : await getInventoryHistory(
                user,
                formattedDateRange.startDate,
                formattedDateRange.endDate,
                categorizedItems,
              );
        setUserHistory(response);
      } catch (error) {
        onError('Error fetching history: ' + error);
      } finally {
        setIsLoading(false);
      }
    }
    findUserHistoryForSelectedDate();
  }, [formattedDateRange, historyType, user, categorizedItems, onError]);

  const transactionsByUser = useMemo(
    () => processTransactionsByUser(userHistory ?? [], loggedInUserId ?? 0),
    [userHistory, loggedInUserId],
  );

  return {
    userHistory,
    transactionsByUser,
    isLoading,
  };
}
