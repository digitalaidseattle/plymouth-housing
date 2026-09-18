/**
 *  itemsService.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  CategoryItem,
  CategoryProps,
  ClientPrincipal,
  InventoryItem,
} from '../types/interfaces';
import { ENDPOINTS, SETTINGS } from '../types/constants';
import { cacheGet, cacheSet, cacheTimestamp } from '../utils/sessionCache';
import { getRole } from '../utils/userUtils';
import { apiRequest } from './apiRequest';

const CATEGORIZED_ITEMS_KEY = 'categorizedItems';

export function getCategorizedItemsTimestamp(): number | null {
  return cacheTimestamp(CATEGORIZED_ITEMS_KEY);
}

export async function getCategorizedItems(
  user: ClientPrincipal | null,
  forceRefresh = false,
): Promise<CategoryProps[]> {
  if (!forceRefresh) {
    const cached = cacheGet<CategoryProps[]>(CATEGORIZED_ITEMS_KEY);
    if (cached) return cached;
  }

  try {
    const result = await apiRequest<CategoryProps[]>({
      url: ENDPOINTS.CATEGORIZED_ITEMS,
      role: getRole(user),
    });
    cacheSet(CATEGORIZED_ITEMS_KEY, result.value);
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

