import { useState, useEffect, useRef } from 'react';
import {
  ClientPrincipal,
  CheckoutHistoryItem,
  TransactionItem,
} from '../types/interfaces';
import { SPECIAL_ITEMS } from '../types/constants';
import { checkPastCheckout } from '../services/CheckoutAPICalls';

interface UseCheckoutHistoryProps {
  user: ClientPrincipal | null;
  residentId: number;
  residentInfoIsMissing: boolean;
  onError?: (message: string) => void;
}

// Returns a deduplicated list of tracked items (appliances, rug) previously checked out by a resident.
// Appliance Miscellaneous entries are grouped by additionalNotes (appliance name) rather than item_id,
// since multiple distinct appliances share the same item_id.
export function useCheckoutHistory({
  user,
  residentId,
  residentInfoIsMissing,
  onError,
}: UseCheckoutHistoryProps) {
  const [checkoutHistory, setCheckoutHistory] = useState<CheckoutHistoryItem[]>(
    [],
  );

  // Use a ref so onError never appears in useEffect dependency arrays
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (residentInfoIsMissing) {
      setCheckoutHistory([]);
      return;
    }

    let mounted = true; // prevents state update if component unmounts before fetch completes

    async function fetchCheckoutHistory() {
      try {
        const tempCheckOutHistory: CheckoutHistoryItem[] = [];
        const response = await checkPastCheckout(user, residentId);

        response.value.forEach((transaction: TransactionItem) => {
          if (transaction.item_id === SPECIAL_ITEMS.APPLIANCE_MISC) {
            if (
              tempCheckOutHistory.find(
                (entry) =>
                  entry.additionalNotes.toLowerCase() ===
                  transaction.additional_notes.toLowerCase(),
              )
            ) {
              return;
            }
            const checkedOutQuantity = response.value
              .filter(
                (item: TransactionItem) =>
                  item.additional_notes &&
                  item.additional_notes.toLowerCase() ===
                    transaction.additional_notes.toLowerCase(),
              )
              .reduce(
                (acc: number, t: { quantity: number }) => acc + t.quantity,
                0,
              );
            tempCheckOutHistory.push({
              item_id: SPECIAL_ITEMS.APPLIANCE_MISC,
              timesCheckedOut: checkedOutQuantity,
              additionalNotes: transaction.additional_notes,
            });
          } else {
            if (
              tempCheckOutHistory.find(
                (entry) => entry.item_id === transaction.item_id,
              )
            ) {
              return;
            }
            const checkedOutQuantity = response.value
              .filter(
                (item: TransactionItem) => item.item_id === transaction.item_id,
              )
              .reduce(
                (acc: number, t: { quantity: number }) => acc + t.quantity,
                0,
              );
            tempCheckOutHistory.push({
              item_id: transaction.item_id,
              timesCheckedOut: checkedOutQuantity,
              additionalNotes: '',
            });
          }
        });

        if (mounted) setCheckoutHistory(tempCheckOutHistory);
      } catch (err) {
        console.error('Failed to fetch checkout history:', err);
        if (mounted) {
          setCheckoutHistory([]);
          onErrorRef.current?.('Failed to load checkout history. Please try again.');
        }
      }
    }

    fetchCheckoutHistory();
    return () => {
      mounted = false;
    };
  }, [user, residentId, residentInfoIsMissing]);

  return { checkoutHistory };
}
