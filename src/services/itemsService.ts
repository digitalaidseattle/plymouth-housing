import {
  CategoryItem,
  CategoryProps,
  ClientPrincipal,
  InventoryItem,
} from '../types/interfaces';
import { ENDPOINTS, API_HEADERS, SETTINGS } from '../types/constants';
import { cacheGet, cacheSet } from '../utils/sessionCache';
import { getRole } from '../utils/userUtils';

export async function getCategorizedItems(
  user: ClientPrincipal | null,
): Promise<CategoryProps[]> {
  const cached = cacheGet<CategoryProps[]>('categorizedItems');
  if (cached) return cached;

  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.CATEGORIZED_ITEMS, {
    headers,
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();
  cacheSet('categorizedItems', data.value);
  return data.value;
}

export async function getItems(
  user: ClientPrincipal | null,
): Promise<InventoryItem[]> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(
    `${ENDPOINTS.EXPANDED_ITEMS}?$first=${SETTINGS.api_fetch_limit_items}`,
    { headers, method: 'GET' },
  );
  if (!response.ok) {
    if (response.status === 500) {
      throw new Error(
        'Database is likely starting up. Try again in 30 seconds.',
      );
    }
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return data.value;
}

export async function getCategories(
  user: ClientPrincipal | null,
): Promise<CategoryItem[]> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.CATEGORY, { headers, method: 'GET' });
  if (!response.ok) throw new Error(response.statusText);
  const data = await response.json();
  return data.value;
}

export async function createItem(
  user: ClientPrincipal | null,
  data: object,
): Promise<void> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.ITEMS, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(response.statusText);
}

export async function updateItem(
  user: ClientPrincipal | null,
  id: number,
  data: object,
): Promise<void> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(`${ENDPOINTS.ITEMS}/id/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(response.statusText);
}
