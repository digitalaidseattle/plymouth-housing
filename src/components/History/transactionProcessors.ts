import { CheckoutTransaction, InventoryTransaction } from '../../types/history';
import { CategoryProps } from '../../types/interfaces';
import { checkIfWelcomeBasket } from './historyUtils';

export function processTransactionsByUser(
  history: CheckoutTransaction[] | InventoryTransaction[],
  loggedInUserId: number,
) {
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

export function expandTransactionItems(
  data: any[],
  categorizedItems: CategoryProps[],
) {
  return data.flatMap((transaction) => {
    let items = [];
    if (typeof transaction.items === 'string') {
      try {
        items = JSON.parse(transaction.items);
      } catch (error) {
        console.warn('Failed to parse items JSON:', error);
        items = [];
      }
    } else if (Array.isArray(transaction.items)) {
      items = transaction.items;
    }
    transaction.items = items;

    // Add item_type field based on first item
    const firstItemId = items.length > 0 ? items[0].item_id : null;
    transaction.item_type =
      firstItemId && checkIfWelcomeBasket(firstItemId, categorizedItems)
        ? 'welcome'
        : 'general';

    return transaction;
  });
}
