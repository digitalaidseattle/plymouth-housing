import { getRole } from '../contexts/UserContext';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { ClientPrincipal } from '../../types/interfaces';

export async function findCheckoutHistory(
  user: ClientPrincipal | null,
  checkoutDate: string,
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.FIND_CHECKOUT_HISTORY, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        checkout_date: checkoutDate,
      }),
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
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
