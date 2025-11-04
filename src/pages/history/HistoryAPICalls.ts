import { getRole } from '../../components/contexts/UserContext';
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
    if (!response.ok) {
      if (response.status === 500) {
        throw new Error(
          'Database is likely starting up. Try again in 30 seconds.',
        );
      } else {
        throw new Error(response.statusText);
      }
    }
    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
}
