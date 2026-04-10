import {
  CategoryItem,
  CategoryProps,
  ClientPrincipal,
  InventoryItem,
} from '../types/interfaces';
import { ENDPOINTS, SETTINGS } from '../types/constants';
import { cacheGet, cacheSet } from '../utils/sessionCache';
import { getRole } from '../utils/userUtils';
import { apiRequest } from './apiRequest';

export async function getCategorizedItems(
  user: ClientPrincipal | null
): Promise<CategoryProps[]> {
  const cached = cacheGet<CategoryProps[]>('categorizedItems');
  if (cached) return cached;

  try {
    const result = await apiRequest<CategoryProps[]>({
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
    const result = await apiRequest<InventoryItem[]>({
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
    const result = await apiRequest<CategoryItem[]>({
      url: ENDPOINTS.CATEGORY,
      role: getRole(user),
    });
    return result.value;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

