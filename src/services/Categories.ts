import { ClientPrincipal, CategoryItem } from '../types/interfaces';
import { ENDPOINTS, API_HEADERS } from '../types/constants';
import { getRole } from '../utils/userUtils';

export async function getCategories(user: ClientPrincipal | null): Promise<CategoryItem[]> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.CATEGORY + '?$first=10000', { headers, method: 'GET' });
  if (!response.ok) {
    if (response.status === 500) {
      throw new Error('Database is likely starting up. Try again in 30 seconds.');
    }
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return (data.value || []).map((cat: { id: number; name: string; checkout_limit: number }) => ({
    id: cat.id,
    name: cat.name,
    item_limit: cat.checkout_limit,
  }));
}

export async function createCategory(
  user: ClientPrincipal | null,
  category: Omit<CategoryItem, 'id'>,
): Promise<void> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.CATEGORY, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: category.name, checkout_limit: category.item_limit }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || response.statusText);
  }
}

export async function updateCategory(
  user: ClientPrincipal | null,
  id: number,
  updates: Partial<CategoryItem>,
): Promise<void> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const dbUpdates: Record<string, string | number> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.item_limit !== undefined) dbUpdates.checkout_limit = updates.item_limit;
  const response = await fetch(`${ENDPOINTS.CATEGORY}/id/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(dbUpdates),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || response.statusText);
  }
}
