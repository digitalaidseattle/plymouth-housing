import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { ClientPrincipal } from '../types/interfaces';
import { getRole } from '../utils/userUtils';
import { getErrorMessage } from '../utils/apiUtils';

interface InventoryResult {
  Status: string;
  ErrorCode?: string;
  message?: string;
}

export async function processInventoryChange(
  user: ClientPrincipal | null,
  userId: number,
  items: { id: number; quantity: number }[],
  transactionId: string,
): Promise<InventoryResult[]> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  try {
    const response = await fetch(ENDPOINTS.PROCESS_INVENTORY_CHANGE, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        item: items,
        new_transaction_id: transactionId,
      }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    const result = await response.json();
    if (!result) throw new Error('Response contained no data');
    if (result.error)
      throw new Error(result.error.message || 'An unknown error occurred');
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
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  try {
    const response = await fetch(ENDPOINTS.PROCESS_INVENTORY_RESET_QUANTITY, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        item_id: itemId,
        new_quantity: newQuantity,
        additional_notes: additionalNotes,
        new_transaction_id: transactionId,
      }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data?.value ?? [];
  } catch (error) {
    console.error('Error processing inventory reset quantity:', error);
    throw error;
  }
}
