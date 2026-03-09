import {
  CheckoutTransaction,
  InventoryTransaction,
  TransactionType,
  TransactionsByUser,
} from '../../types/interfaces';

type CheckoutRow = {
  user_id: number;
  transaction_id: string;
  resident_id: number;
  resident_name: string;
  unit_number: string;
  building_id: number;
  transaction_date: string;
  total_quantity: number;
  welcome_basket_item_id: number | null;
  welcome_basket_quantity: number | null;
};

type InventoryRow = {
  user_id: number;
  transaction_id: string;
  transaction_type: number;
  transaction_date: string;
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

export function mapCheckoutRows(rows: CheckoutRow[]): CheckoutTransaction[] {
  return rows.map((row) => ({
    user_id: row.user_id,
    transaction_id: row.transaction_id,
    resident_id: row.resident_id,
    resident_name: row.resident_name,
    unit_number: row.unit_number,
    building_id: row.building_id,
    transaction_date: row.transaction_date,
    total_quantity: row.total_quantity,
    welcome_basket_item_id: row.welcome_basket_item_id,
    welcome_basket_quantity: row.welcome_basket_quantity,
    item_type: row.welcome_basket_item_id != null ? 'welcome' : 'general',
  }));
}

function toInventoryTransactionType(
  value: number,
): TransactionType.InventoryAdd | TransactionType.InventoryReplaceValue {
  if (value === TransactionType.InventoryAdd) {
    return TransactionType.InventoryAdd;
  }
  if (value === TransactionType.InventoryReplaceValue) {
    return TransactionType.InventoryReplaceValue;
  }
  throw new Error(`Invalid transaction type value: ${value}`);
}

export function mapInventoryRows(rows: InventoryRow[]): InventoryTransaction[] {
  return rows.map((row) => ({
    user_id: row.user_id,
    transaction_id: row.transaction_id,
    transaction_type: toInventoryTransactionType(row.transaction_type),
    transaction_date: row.transaction_date,
    item_name: row.item_name,
    category_name: row.category_name,
    quantity: row.quantity,
  }));
}
