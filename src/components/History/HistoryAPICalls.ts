import { getRole } from '../contexts/UserContext';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { ClientPrincipal, CategoryProps } from '../../types/interfaces';
import { expandTransactionItems } from './transactionProcessors';

export async function findUserTransactionHistory(
  user: ClientPrincipal | null,
  startDate: string,
  endDate: string,
  historyType: string,
  categorizedItems: CategoryProps[] = [],
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.FIND_USER_TRANSACTION_HISTORY, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        history_type: historyType,
      }),
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return expandTransactionItems(data.value, categorizedItems);
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
