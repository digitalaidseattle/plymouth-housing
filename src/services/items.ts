import { CategoryProps, ClientPrincipal } from '../types/interfaces';
import { ENDPOINTS, API_HEADERS } from '../types/constants';
import { cacheGet, cacheSet } from '../utils/sessionCache';
import { getRole } from '../utils/userUtils';

export async function getCategorizedItems(user: ClientPrincipal | null): Promise<CategoryProps[]> {
  const cached = cacheGet<CategoryProps[]>('categorizedItems');
  if (cached) return cached;

  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.CATEGORIZED_ITEMS, { headers, method: 'GET' });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();
  cacheSet('categorizedItems', data.value);
  return data.value;
}
