import { useState, useEffect, useContext, useCallback } from 'react';
import { TransactionHistory } from '../../types/interfaces';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../../components/contexts/UserContext';

export const useTransactions = () => {
  const { user } = useContext(UserContext);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...API_HEADERS,
        'X-MS-API-ROLE': getRole(user)
      };

      const response = await fetch(ENDPOINTS.TRANSACTION_HISTORY, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const data = await response.json();
      const transactionData: TransactionHistory[] = data.value || [];

      // Sort by transaction_date descending (most recent first)
      const sortedData = transactionData.sort((a, b) =>
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      );

      setTransactions(sortedData);
      setFilteredTransactions(sortedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [user, fetchTransactions]);

  return {
    transactions,
    filteredTransactions,
    setFilteredTransactions,
    loading,
    error,
    refetch: fetchTransactions
  };
};
