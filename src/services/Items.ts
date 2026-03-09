import { ClientPrincipal, AdminItem } from '../types/interfaces';
import { ENDPOINTS, API_HEADERS } from '../types/constants';
import { getRole } from '../utils/userUtils';

export async function getItems(user: ClientPrincipal | null): Promise<AdminItem[]> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.ITEMS + '?$first=10000', { headers, method: 'GET' });
  if (!response.ok) {
    if (response.status === 500) {
      throw new Error('Database is likely starting up. Try again in 30 seconds.');
    }
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return data.value || [];
}

// TODO(human): implement createItem
export async function createItem(
  user: ClientPrincipal | null,
  item: Omit<AdminItem, 'id' | 'category_name'>,
): Promise<void> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(`${ENDPOINTS.ITEMS}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || response.statusText);
  }
}

export async function updateItem(
  user: ClientPrincipal | null,
  id: number,
  updates: Partial<Omit<AdminItem, 'category_name'>>,
): Promise<void> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(`${ENDPOINTS.ITEMS}/id/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || response.statusText);
  }
}
