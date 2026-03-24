import { getRole } from '../utils/userUtils';
import { ENDPOINTS } from '../types/constants';
import {
  ClientPrincipal,
  CheckoutTransaction,
  InventoryTransaction,
} from '../types/interfaces';
import {
  mapCheckoutRows,
  mapInventoryRows,
} from '../components/History/transactionProcessors';
import { apiRequest } from './apiRequest';

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
