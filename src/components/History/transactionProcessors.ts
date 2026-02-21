import {
  CheckoutTransaction,
  InventoryTransaction,
  TransactionsByUser,
} from '../../types/history';
import { CategoryProps } from '../../types/interfaces';
import { checkIfWelcomeBasket } from './historyUtils';

// Flat row from database (one row per transaction item)
type FlatCheckoutRow = {
  user_id: number;
  transaction_id: string;
  resident_id: number;
  resident_name: string;
  unit_number: string;
  building_id: number;
  transaction_date: string;
  item_id: number;
  item_name: string;
  category_name: string;
  quantity: number;
};

type FlatInventoryRow = {
  user_id: number;
  transaction_id: string;
  transaction_type: number;
  transaction_date: string;
  item_id: number;
  item_name: string;
  category_name: string;
  quantity: number;
};

export function processTransactionsByUser(
  history: CheckoutTransaction[] | InventoryTransaction[],
  loggedInUserId: number,
): TransactionsByUser<CheckoutTransaction | InventoryTransaction>[] {
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
  return uniqueUsers.map((userId) => ({
    user_id: userId,
    transactions: history.filter((h) => h.user_id === userId),
  }));
}

export function groupCheckoutTransactions(
  flatRows: FlatCheckoutRow[],
  categorizedItems: CategoryProps[],
): CheckoutTransaction[] {
  const grouped = new Map<string, CheckoutTransaction>();

  for (const row of flatRows) {
    if (!grouped.has(row.transaction_id)) {
      grouped.set(row.transaction_id, {
        user_id: row.user_id,
        transaction_id: row.transaction_id,
        resident_id: row.resident_id,
        resident_name: row.resident_name,
        unit_number: row.unit_number,
        building_id: row.building_id,
        transaction_date: row.transaction_date,
        items: [],
        item_type: 'general', // Will be updated below
      });
    }

    const transaction = grouped.get(row.transaction_id)!;
    transaction.items.push({
      item_id: row.item_id,
      item_name: row.item_name,
      category_name: row.category_name,
      quantity: row.quantity,
    });
  }

  // Determine item_type for each transaction
  return Array.from(grouped.values()).map((transaction) => {
    const firstItemId = transaction.items[0]?.item_id;
    transaction.item_type =
      firstItemId && checkIfWelcomeBasket(firstItemId, categorizedItems)
        ? 'welcome'
        : 'general';
    return transaction;
  });
}

export function groupInventoryTransactions(
  flatRows: FlatInventoryRow[],
  categorizedItems: CategoryProps[],
): InventoryTransaction[] {
  const grouped = new Map<string, InventoryTransaction>();

  for (const row of flatRows) {
    if (!grouped.has(row.transaction_id)) {
      grouped.set(row.transaction_id, {
        user_id: row.user_id,
        transaction_id: row.transaction_id,
        transaction_type: row.transaction_type,
        transaction_date: row.transaction_date,
        items: [],
        item_type: 'general', // Will be updated below
      });
    }

    const transaction = grouped.get(row.transaction_id)!;
    transaction.items.push({
      item_id: row.item_id,
      item_name: row.item_name,
      category_name: row.category_name,
      quantity: row.quantity,
    });
  }

  // Determine item_type for each transaction
  return Array.from(grouped.values()).map((transaction) => {
    const firstItemId = transaction.items[0]?.item_id;
    transaction.item_type =
      firstItemId && checkIfWelcomeBasket(firstItemId, categorizedItems)
        ? 'welcome'
        : 'general';
    return transaction;
  });
}
