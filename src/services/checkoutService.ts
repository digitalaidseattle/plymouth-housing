import { getRole } from '../utils/userUtils';
import { CheckoutItemProp, ClientPrincipal, ResidentInfo } from '../types/interfaces';
import { ENDPOINTS } from '../types/constants';
import { apiRequest } from './apiRequest';

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
