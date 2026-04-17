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

export async function getTransaction(
  user: ClientPrincipal | null,
  id: string,
): Promise<{ value: CheckoutTransaction | null } | undefined> {
  try {
    const result = await apiRequest<DabTransactionRow[]>({
      url: ENDPOINTS.GET_TRANSACTION,
      role: getRole(user),
      method: 'POST',
      body: { id },
    });

    if (!result?.value?.length) {
      return { value: null };
    }

    const row = result.value[0];
    return {
      value: {
        ...row,
        items: JSON.parse(row.items) as TransactionItem[],
      },
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}

// Loads complete transaction data for editing: fetches original transaction details,
// finds all correction transactions, and computes effective items
export async function getEditTransactionData(
  user: ClientPrincipal | null,
  checkoutTransaction: CheckoutTransaction,
): Promise<EditTransactionState> {
  const data: EditTransactionState = {
    originalTransaction: null,
    correctionTransactions: [],
    itemNames: new Map<number, string>(),
    effectiveItems: [],
  };

  try {
    const [transactionResult, itemsResult] = await Promise.all([
      getTransaction(user, checkoutTransaction.transaction_id),
      getItems(user),
    ]);

    data.originalTransaction = transactionResult?.value ?? null;
    data.correctionTransactions = [];
    const itemNames = new Map((itemsResult as unknown[]).map((i: unknown) => {
      const item = i as { id: number; name: string };
      return [item.id, item.name];
    }));

    data.itemNames = itemNames;

    data.effectiveItems = computeEffectiveItems(
      data.originalTransaction,
      data.correctionTransactions,
      data.itemNames,
    );

  } catch (error) {
    console.error('Error loading transaction data:', error);
  }

  return data;
}