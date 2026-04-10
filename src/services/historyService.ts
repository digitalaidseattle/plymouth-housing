import { getRole } from '../utils/userUtils';
import { ENDPOINTS } from '../types/constants';
import {
  ClientPrincipal,
  CheckoutRow,
  CheckoutTransaction,
  InventoryRow,
  InventoryTransaction,
} from '../types/interfaces';
import {
  mapCheckoutRows,
  mapInventoryRows,
} from '../components/History/transactionProcessors';
import { apiRequest } from './apiRequest';

export async function getCheckoutHistory(
  user: ClientPrincipal | null,
  startDate: string,
  endDate: string,
): Promise<CheckoutTransaction[]> {
  try {
    const result = await apiRequest<CheckoutRow[]>({
      url: ENDPOINTS.GET_CHECKOUT_HISTORY,
      role: getRole(user),
      method: 'POST',
      body: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return mapCheckoutRows(result.value);
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
    const result = await apiRequest<InventoryRow[]>({
      url: ENDPOINTS.GET_INVENTORY_HISTORY,
      role: getRole(user),
      method: 'POST',
      body: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return mapInventoryRows(result.value);
  } catch (error) {
    console.error('Error fetching inventory history:', error);
    throw error;
  }
}
