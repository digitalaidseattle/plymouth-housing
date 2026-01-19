import {
  CheckoutItemResponse,
  InventoryItemResponse,
  HistoryResponse,
  CheckoutTransaction,
  InventoryTransaction,
  TransactionsByUser,
} from '../../types/history';
import { CategoryProps } from '../../types/interfaces';
import { checkIfWelcomeBasket } from './historyUtils';

/**
 * Converts a history response to an inventory transaction
 * @param entry - Raw history response from API
 * @param categorizedItems - Categorized items for welcome basket detection
 * @returns Structured inventory transaction
 */
export function createInventoryTransaction(
  entry: HistoryResponse,
  categorizedItems: CategoryProps[],
): InventoryTransaction {
  const inventoryEntry = entry as InventoryItemResponse;
  return {
    id: inventoryEntry.id,
    transaction_type: inventoryEntry.transaction_type,
    item_id: inventoryEntry.item_id,
    item_name: inventoryEntry.item_name,
    category_name: inventoryEntry.category_name,
    quantity: inventoryEntry.quantity,
    timestamp: inventoryEntry.timestamp,
    item_type: checkIfWelcomeBasket(inventoryEntry.item_id, categorizedItems)
      ? 'welcome-basket'
      : 'general',
  };
}

/**
 * Merges checkout transaction items or creates a new transaction
 * @param transactions - Existing transaction list
 * @param entry - New history entry
 * @param categorizedItems - Categorized items for welcome basket detection
 * @returns Updated transaction list with merged or new entry
 */
export function mergeCheckoutTransaction(
  transactions: (CheckoutTransaction | InventoryTransaction)[],
  entry: HistoryResponse,
  categorizedItems: CategoryProps[],
): (CheckoutTransaction | InventoryTransaction)[] {
  const checkoutEntry = entry as CheckoutItemResponse;
  const existingIndex = transactions.findIndex(
    (t) => t.id === checkoutEntry.id,
  );

  if (existingIndex !== -1) {
    const existing = transactions[existingIndex] as CheckoutTransaction;
    existing.items.push({
      item_id: checkoutEntry.item_id,
      quantity: checkoutEntry.quantity,
    });
    return transactions;
  }

  return [
    ...transactions,
    {
      id: checkoutEntry.id,
      resident_name: checkoutEntry.resident_name,
      building_id: checkoutEntry.building_id,
      unit_number: checkoutEntry.unit_number,
      items: [
        {
          item_id: checkoutEntry.item_id,
          quantity: checkoutEntry.quantity,
        },
      ],
      timestamp: checkoutEntry.timestamp,
      item_type: checkIfWelcomeBasket(checkoutEntry.item_id, categorizedItems)
        ? 'welcome-basket'
        : 'general',
    },
  ];
}

/**
 * Restructures raw history data to organize transactions by user
 * @param history - Raw history from API
 * @param historyType - Type of history ('checkout' or 'inventory')
 * @param loggedInUserId - ID of currently logged-in user
 * @param categorizedItems - Categorized items for transaction processing
 * @returns Transactions organized by user with logged-in user first
 */
export function processTransactionsByUser(
  history: HistoryResponse[] | null,
  historyType: 'checkout' | 'inventory',
  loggedInUserId: number | null | undefined,
  categorizedItems: CategoryProps[],
): TransactionsByUser[] {
  if (!history) return [];

  let uniqueUsers = [...new Set(history.map((t) => t.user_id))];

  // Check if logged in user is in the array; if so, put this user at the front
  if (
    loggedInUserId &&
    uniqueUsers.find((userId) => userId === loggedInUserId)
  ) {
    const filteredUsers = uniqueUsers.filter(
      (userId) => userId !== loggedInUserId,
    );
    uniqueUsers = [loggedInUserId, ...filteredUsers];
  }

  const sortedTransactionsByUser = uniqueUsers.map((userId) => ({
    user_id: userId,
    transactions: history
      .filter((entry) => entry.user_id === userId)
      .reduce(
        (transactions, entry) => {
          if (historyType === 'inventory') {
            return [
              ...transactions,
              createInventoryTransaction(entry, categorizedItems),
            ];
          }
          return mergeCheckoutTransaction(
            transactions,
            entry,
            categorizedItems,
          );
        },
        [] as (CheckoutTransaction | InventoryTransaction)[],
      ),
  }));

  return sortedTransactionsByUser;
}
