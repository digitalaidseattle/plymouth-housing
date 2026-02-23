import { useState, useCallback, useContext } from 'react';
import { UserContext } from '../../components/contexts/UserContext';
import { AdminItem, CategoryItem } from '../../types/interfaces';
import { getItems, createItem as createItemAPI, updateItem as updateItemAPI } from '../../services/Items';
import { getCategories, createCategory as createCategoryAPI, updateCategory as updateCategoryAPI } from '../../services/Categories';

export const useCatalog = () => {
  const { user } = useContext(UserContext);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(() => getItems(user), [user]);
  const loadCategories = useCallback(() => getCategories(user), [user]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        loadItems(),
        loadCategories(),
      ]);

      // Map category names to items
      const categoryMap = new Map(
        categoriesData.map((cat: CategoryItem) => [cat.id, cat.name]),
      );

      const itemsWithCategoryNames = itemsData.map((item: AdminItem) => ({
        ...item,
        category_name: categoryMap.get(item.category_id) || 'Unknown',
      }));

      setItems(itemsWithCategoryNames);
      setCategories(categoriesData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [loadItems, loadCategories]);

  const createItem = useCallback(
    async (item: Omit<AdminItem, 'id' | 'category_name'>) => {
      await createItemAPI(user, item);
      await fetchData();
      return true;
    },
    [user, fetchData],
  );

  const updateItem = useCallback(
    async (id: number, updates: Partial<AdminItem>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { category_name, ...updateData } = updates;
      await updateItemAPI(user, id, updateData);
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, ...updateData };
            if (updateData.category_id) {
              const category = categories.find((c) => c.id === updateData.category_id);
              updatedItem.category_name = category?.name || 'Unknown';
            }
            return updatedItem;
          }
          return item;
        }),
      );
      return true;
    },
    [user, categories],
  );

  const createCategory = useCallback(
    async (category: Omit<CategoryItem, 'id'>) => {
      await createCategoryAPI(user, category);
      await fetchData();
      return true;
    },
    [user, fetchData],
  );

  const updateCategory = useCallback(
    async (id: number, updates: Partial<CategoryItem>) => {
      await updateCategoryAPI(user, id, updates);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)),
      );
      if (updates.name) {
        setItems((prev) =>
          prev.map((item) =>
            item.category_id === id ? { ...item, category_name: updates.name } : item,
          ),
        );
      }
      return true;
    },
    [user],
  );

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
