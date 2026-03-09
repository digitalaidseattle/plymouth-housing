import { getRole } from '../utils/userUtils';
import { getErrorMessage } from '../utils/apiUtils';
import { ENDPOINTS, API_HEADERS } from '../types/constants';
import {
  ClientPrincipal,
  CheckoutTransaction,
  InventoryTransaction,
} from '../types/interfaces';
import {
  mapCheckoutRows,
  mapInventoryRows,
} from '../components/History/transactionProcessors';

export async function getCheckoutHistory(
  user: ClientPrincipal | null,
  startDate: string,
  endDate: string,
): Promise<CheckoutTransaction[]> {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.GET_CHECKOUT_HISTORY, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
      }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return mapCheckoutRows(data.value);
  } catch (error) {
    console.error('Error fetching checkout history:', error);
    throw error;
  }
}

export async function getInventoryHistory(
  user: ClientPrincipal | null,
  startDate: string,
  endDate: string,
): Promise<InventoryTransaction[]> {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.GET_INVENTORY_HISTORY, {
      headers,
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
      }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return mapInventoryRows(data.value);
  } catch (error) {
    console.error('Error fetching inventory history:', error);
    throw error;
  }
}
