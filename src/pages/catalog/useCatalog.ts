import { useState, useCallback, useContext } from 'react';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { AdminItem, CategoryItem } from '../../types/interfaces';

export const useCatalog = () => {
  const { user } = useContext(UserContext);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.ITEMS + '?$first=10000', {
      headers,
      method: 'GET',
    });
    if (!response.ok) {
      if (response.status === 500) {
        throw new Error('Database is likely starting up. Try again in 30 seconds.');
      }
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.value || [];
  }, [user]);

  const fetchCategories = useCallback(async () => {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.CATEGORY + '?$first=10000', {
      headers,
      method: 'GET',
    });
    if (!response.ok) {
      if (response.status === 500) {
        throw new Error('Database is likely starting up. Try again in 30 seconds.');
      }
      throw new Error(response.statusText);
    }
    const data = await response.json();
    // Map database field checkout_limit to interface field item_limit
    return (data.value || []).map((cat: { id: number; name: string; checkout_limit: number }) => ({
      id: cat.id,
      name: cat.name,
      item_limit: cat.checkout_limit,
    }));
  }, [user]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        fetchItems(),
        fetchCategories(),
      ]);

      // Map category names to items
      const categoryMap = new Map(
        categoriesData.map((cat: CategoryItem) => [cat.id, cat.name])
      );

      const itemsWithCategoryNames = itemsData.map((item: AdminItem) => ({
        ...item,
        category_name: categoryMap.get(item.category_id) || 'Unknown',
      }));

      setItems(itemsWithCategoryNames);
      setCategories(categoriesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, fetchCategories]);

  const createItem = useCallback(async (item: Omit<AdminItem, 'id' | 'category_name'>) => {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.ITEMS, {
      method: 'POST',
      headers,
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || response.statusText);
    }
    await fetchData();
    return true;
  }, [user, fetchData]);

  const updateItem = useCallback(async (id: number, updates: Partial<AdminItem>) => {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    // Remove fields that shouldn't be sent in the update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category_name, ...updateData } = updates;

    const response = await fetch(`${ENDPOINTS.ITEMS}/id/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || response.statusText);
    }

    // Update local state
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updateData };
        // Update category_name if category_id changed
        if (updateData.category_id) {
          const category = categories.find(c => c.id === updateData.category_id);
          updatedItem.category_name = category?.name || 'Unknown';
        }
        return updatedItem;
      }
      return item;
    }));

    return true;
  }, [user, categories]);

  const createCategory = useCallback(async (category: Omit<CategoryItem, 'id'>) => {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    // Map interface field item_limit to database field checkout_limit
    const dbCategory = {
      name: category.name,
      checkout_limit: category.item_limit,
    };
    const response = await fetch(ENDPOINTS.CATEGORY, {
      method: 'POST',
      headers,
      body: JSON.stringify(dbCategory),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || response.statusText);
    }
    await fetchData();
    return true;
  }, [user, fetchData]);

  const updateCategory = useCallback(async (id: number, updates: Partial<CategoryItem>) => {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    // Map interface field item_limit to database field checkout_limit
    const dbUpdates: Record<string, string | number> = {};
    if (updates.name !== undefined) {
      dbUpdates.name = updates.name;
    }
    if (updates.item_limit !== undefined) {
      dbUpdates.checkout_limit = updates.item_limit;
    }

    const response = await fetch(`${ENDPOINTS.CATEGORY}/id/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(dbUpdates),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || response.statusText);
    }

    // Update local state
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ));

    // Also update category names in items if the name changed
    if (updates.name) {
      setItems(prev => prev.map(item =>
        item.category_id === id
          ? { ...item, category_name: updates.name }
          : item
      ));
    }

    return true;
  }, [user]);

  const clearError = () => setError(null);

  return {
    items,
    categories,
    isLoading,
    error,
    fetchData,
    createItem,
    updateItem,
    createCategory,
    updateCategory,
    clearError,
  };
};
