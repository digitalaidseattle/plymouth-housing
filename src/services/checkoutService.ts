import { getRole } from '../utils/userUtils';
import { CheckoutItemProp, ClientPrincipal, ResidentInfo, TransactionItem, EditTransactionState, CheckoutTransaction } from '../types/interfaces';
import { ENDPOINTS } from '../types/constants';
import { apiRequest } from './apiRequest';
import { getItems } from './itemsService';
import { computeEffectiveItems } from '../utils/transactionUtils';

export async function processWelcomeBasket(
  newTransactionID: string,
  user: ClientPrincipal | null,
  loggedInUserId: number,
  sheetSetItem: CheckoutItemProp,
  residentInfo: ResidentInfo,
  originalTransactionId?: string | null
) {
  try {
    const body: Record<string, unknown> = {
      new_transaction_id: newTransactionID,
      user_id: loggedInUserId,
      mattress_size: sheetSetItem.id,
      quantity: sheetSetItem.quantity,
      resident_id: residentInfo.id,
      message: '',
    };
    if (originalTransactionId) {
      body.original_transaction_id = originalTransactionId;
    }
    const result = await apiRequest({
      url: ENDPOINTS.CHECKOUT_WELCOME_BASKET,
      role: getRole(user),
      method: 'POST',
      body,
    });
    return result;
  } catch (error) {
    console.error('Error processing welcome basket:', error);
    throw error;
  }
}

export async function processGeneralItems(
  newTransactionID: string,
  user: ClientPrincipal | null,
  loggedInUserId: number,
  checkoutItems: CheckoutItemProp[],
  residentInfo: ResidentInfo,
  originalTransactionId?: string | null
) {
  try {
    const body: Record<string, unknown> = {
      new_transaction_id: newTransactionID,
      user_id: loggedInUserId,
      items: checkoutItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        additional_notes: item.additional_notes,
      })),
      resident_id: residentInfo.id,
      message: '',
    };
    if (originalTransactionId) {
      body.original_transaction_id = originalTransactionId;
    }
    const result = await apiRequest({
      url: ENDPOINTS.CHECKOUT_GENERAL_ITEMS,
      role: getRole(user),
      method: 'POST',
      body,
    });
    return result;
  } catch (error) {
    console.error('Error processing general items:', error);
    throw error;
  }
}

export async function checkPastCheckout(user: ClientPrincipal | null, residentId: number) {
  try {
    const result = await apiRequest<Array<{
      id: number;
      item_id: number;
      quantity: number;
      transaction_id: string;
      additional_notes: string;
    }>>({
      url: ENDPOINTS.CHECK_PAST_CHECKOUT,
      role: getRole(user),
      method: 'POST',
      body: { resident_id: residentId },
    });
    return result;
  } catch (error) {
    console.error('Error checking for a past checkout:', error);
    throw error;
  }
}

type DabTransactionRow = Omit<CheckoutTransaction, 'items'> & { items: string };

// Fetches a transaction and all its corrections (children). Returns multiple rows:
export async function getTransaction(
  user: ClientPrincipal | null,
  id: string,
): Promise<{ value: DabTransactionRow[] } | undefined> {
  try {
    const result = await apiRequest<DabTransactionRow[]>({
      url: ENDPOINTS.GET_TRANSACTION,
      role: getRole(user),
      method: 'POST',
      body: { id },
    });

    return result;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}

export async function getEditTransactionData(
  user: ClientPrincipal | null,
  checkoutTransaction: CheckoutTransaction,
): Promise<EditTransactionState> {
  const empty: EditTransactionState = {
    originalTransaction: null,
    correctionTransactions: [],
    itemNames: new Map(),
    effectiveItems: [],
  };

  try {
    const [txResult, items] = await Promise.all([
      getTransaction(user, checkoutTransaction.transaction_id),
      getItems(user),
    ]);

    const rows = txResult?.value ?? [];
    if (rows.length === 0) return empty;

    const parseRow = (row: DabTransactionRow, isCorrection: boolean): CheckoutTransaction => {
      const parsedItems = JSON.parse(row.items) as TransactionItem[];
      return {
        ...row,
        items: parsedItems,
        item_type: 'general',
        welcome_basket_item_id: null,
        welcome_basket_quantity: null,
        total_quantity: parsedItems.reduce((sum, item) => sum + item.quantity, 0),
        is_edited: isCorrection,
      };
    };

    const originalTransaction = parseRow(rows[0], false);
    const correctionTransactions = rows.slice(1).map((row) => parseRow(row, true));
    const itemNames = new Map(items.map((i) => [i.id, i.name]));

    return {
      originalTransaction,
      correctionTransactions,
      itemNames,
      effectiveItems: computeEffectiveItems(originalTransaction, correctionTransactions, itemNames),
    };
  } catch (error) {
    console.error('Error loading transaction data:', error);
    return empty;
  }
}