import {
  CheckoutRow,
  CheckoutTransaction,
  InventoryRow,
  InventoryTransaction,
  TransactionType,
  TransactionsByUser,
} from '../../types/interfaces';

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

// Maps raw checkout rows to CheckoutTransactions. CHECKOUT_EDIT (type=4) rows are filtered out
export function mapCheckoutRows(rows: CheckoutRow[]): CheckoutTransaction[] {
  const editsByParent = new Map<string, CheckoutRow[]>();
  for (const row of rows) {
    if (row.transaction_type === TransactionType.CheckoutEdit && row.parent_transaction_id) {
      const edits = editsByParent.get(row.parent_transaction_id) ?? [];
      edits.push(row);
      editsByParent.set(row.parent_transaction_id, edits);
    }
  }

  return rows
    .filter((row) => row.transaction_type === TransactionType.Checkout)
    .map((row) => {
      const edits = editsByParent.get(row.transaction_id) ?? [];
      return {
        user_id: row.user_id,
        transaction_id: row.transaction_id,
        resident_id: row.resident_id,
        resident_name: row.resident_name,
        unit_number: row.unit_number,
        building_id: row.building_id,
        building_code: row.building_code,
        building_name: row.building_name,
        transaction_date: row.transaction_date,
        total_quantity: row.total_quantity,
        welcome_basket_item_id: row.welcome_basket_item_id,
        welcome_basket_quantity: row.welcome_basket_quantity,
        item_type: row.welcome_basket_item_id != null ? 'welcome' : 'general',
        is_edited: edits.length > 0,
      };
    });
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
