import {
  CategoryItem,
  CategoryProps,
  ClientPrincipal,
  InventoryItem,
} from '../types/interfaces';
import { ENDPOINTS, SETTINGS } from '../types/constants';
import { cacheGet, cacheSet } from '../utils/sessionCache';
import { getRole } from '../utils/userUtils';
import { fetchWithRetry } from './fetchWithRetry';

export async function getCategorizedItems(
  user: ClientPrincipal | null,
): Promise<CategoryProps[]> {
  const cached = cacheGet<CategoryProps[]>('categorizedItems');
  if (cached) return cached;

  try {
    const result = await fetchWithRetry<CategoryProps[]>({
      url: ENDPOINTS.CATEGORIZED_ITEMS,
      role: getRole(user),
    });
    cacheSet('categorizedItems', result.value);
    return result.value;
  } catch (error) {
    console.error('Error fetching categorized items:', error);
    throw error;
  }
}

export async function getItems(
  user: ClientPrincipal | null,
): Promise<InventoryItem[]> {
  try {
    const result = await fetchWithRetry<InventoryItem[]>({
      url: `${ENDPOINTS.EXPANDED_ITEMS}?$first=${SETTINGS.api_fetch_limit_items}`,
      role: getRole(user),
    });
    return result.value;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}

export async function getCategories(
  user: ClientPrincipal | null,
): Promise<CategoryItem[]> {
  try {
    const result = await fetchWithRetry<CategoryItem[]>({
      url: ENDPOINTS.CATEGORY,
      role: getRole(user),
    });
    return result.value;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function createItem(
  user: ClientPrincipal | null,
  data: object,
): Promise<void> {
  try {
    await fetchWithRetry({
      url: ENDPOINTS.ITEMS,
      role: getRole(user),
      method: 'POST',
      body: data,
    });
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
}

export async function updateItem(
  user: ClientPrincipal | null,
  id: number,
  data: object,
): Promise<void> {
  try {
    await fetchWithRetry({
      url: `${ENDPOINTS.ITEMS}/id/${id}`,
      role: getRole(user),
      method: 'PATCH',
      body: data,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}
