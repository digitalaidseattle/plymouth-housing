import { ENDPOINTS } from '../types/constants';
import { ClientPrincipal, InventoryResult } from '../types/interfaces';
import { getRole } from '../utils/userUtils';
import { fetchWithRetry } from './fetchWithRetry';

export async function processInventoryChange(
  user: ClientPrincipal | null,
  userId: number,
  items: { id: number; quantity: number }[],
  transactionId: string,
): Promise<InventoryResult[]> {
  try {
    const result = await fetchWithRetry<InventoryResult[]>({
      url: ENDPOINTS.PROCESS_INVENTORY_CHANGE,
      role: getRole(user),
      method: 'POST',
      body: {
        user_id: userId,
        item: items,
        new_transaction_id: transactionId,
      },
    });
    return result.value ?? [];
  } catch (error) {
    console.error('Error processing inventory change:', error);
    throw error;
  }
}

export async function processInventoryResetQuantity(
  user: ClientPrincipal | null,
  userId: number,
  itemId: number,
  newQuantity: number,
  additionalNotes: string,
  transactionId: string,
): Promise<InventoryResult[]> {
  try {
    const result = await fetchWithRetry<InventoryResult[]>({
      url: ENDPOINTS.PROCESS_INVENTORY_RESET_QUANTITY,
      role: getRole(user),
      method: 'POST',
      body: {
        user_id: userId,
        item_id: itemId,
        new_quantity: newQuantity,
        additional_notes: additionalNotes,
        new_transaction_id: transactionId,
      },
    });
    return result.value ?? [];
  } catch (error) {
    console.error('Error processing inventory reset quantity:', error);
    throw error;
  }
}
