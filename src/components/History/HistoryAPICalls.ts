import { getRole } from '../contexts/UserContext';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { ClientPrincipal, CategoryProps } from '../../types/interfaces';
import { CheckoutTransaction, InventoryTransaction } from '../../types/history';
import {
  groupCheckoutTransactions,
  groupInventoryTransactions,
} from './transactionProcessors';

export async function getCheckoutHistory(
  user: ClientPrincipal | null,
  startDate: string,
  endDate: string,
  categorizedItems: CategoryProps[] = [],
): Promise<CheckoutTransaction[]> {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.GET_CHECKOUT_HISTORY, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
      }),
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return groupCheckoutTransactions(data.value, categorizedItems);
  } catch (error) {
    console.error('Error fetching checkout history:', error);
    throw error;
  }
}

export async function getInventoryHistory(
  user: ClientPrincipal | null,
  startDate: string,
  endDate: string,
  categorizedItems: CategoryProps[] = [],
): Promise<InventoryTransaction[]> {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.GET_INVENTORY_HISTORY, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
      }),
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return groupInventoryTransactions(data.value, categorizedItems);
  } catch (error) {
    console.error('Error fetching inventory history:', error);
    throw error;
  }
}

export async function getUsers(user: ClientPrincipal | null) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.USERS, {
      headers: headers,
      method: 'GET',
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getWelcomeBasketQuantities(user: ClientPrincipal | null) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(
      ENDPOINTS.ITEMS +
        `?$select=items_per_basket&$filter=type eq 'Welcome Basket'`,
      {
        headers: headers,
        method: 'GET',
      },
    );
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('Error fetching welcome basket quantity:', error);
    throw error;
  }
}
