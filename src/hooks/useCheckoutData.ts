import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  CategoryProps,
  CheckoutItemProp,
  Building,
  Unit,
  ClientPrincipal,
  CheckoutType,
} from '../types/interfaces';
import { getBuildings } from '../services/CheckoutAPICalls';
import { getCategorizedItems } from '../services/items';
import { CATEGORY_IDS, WELCOME_BASKET_ITEMS } from '../types/constants';

interface UseCheckoutDataProps {
  user: ClientPrincipal | null;
  checkoutType: CheckoutType;
  onError: (message: string) => void;
}

// Fetches and manages data needed for the checkout page. On mount, loads buildings and all
// categorized inventory items. Derives a clean checkout cart, a filteredData list (excluding
// the Welcome Basket category for general checkouts), and welcomeBasketData scoped to just
// the two welcome basket item types (Full/Twin). Exposes fetchData so the checkout dialog
// can refresh inventory after a successful transaction.
export function useCheckoutData({
  user,
  checkoutType,
  onError,
}: UseCheckoutDataProps) {
  const [data, setData] = useState<CategoryProps[]>([]);
  const [welcomeBasketData, setWelcomeBasketData] = useState<CategoryProps[]>(
    [],
  );
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [unitNumberValues, setUnitNumberValues] = useState<Unit[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CategoryProps[]>([]);

  // Use a ref so onError never appears in useCallback dependency arrays
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  // Returned so CheckoutDialog can refresh inventory after a successful checkout
  const fetchData = useCallback(async () => {
    try {
      const categorizedItems = await getCategorizedItems(user);

      setData(categorizedItems);

      const cleanCheckout = categorizedItems.map((category: CategoryProps) => ({
        ...category,
        categoryCount: 0,
        items: [],
      }));
      setCheckoutItems(cleanCheckout);

      if (checkoutType === 'welcomeBasket') {
        const welcomeBasketCategory = categorizedItems.find(
          (category: CategoryProps) =>
            category.id === CATEGORY_IDS.WELCOME_BASKET,
        );
        if (welcomeBasketCategory) {
          const filteredItems = (welcomeBasketCategory.items || []).filter(
            (item: CheckoutItemProp) =>
              item.id === WELCOME_BASKET_ITEMS.FULL ||
              item.id === WELCOME_BASKET_ITEMS.TWIN,
          );
          setWelcomeBasketData([
            { ...welcomeBasketCategory, items: filteredItems },
          ]);
        } else {
          // TODO: dead code - 'Welcome Basket' category always exists. Should throw instead of silently showing empty page.
          setWelcomeBasketData([]);
        }
      }
    } catch (error) {
      onErrorRef.current('Could not get categorized items. \r\n' + error);
      console.error('Error fetching categorized items:', error);
    }
  }, [user, checkoutType]);

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
        const result = await getBuildings(user);
        if (mounted) setBuildings(result);
      } catch (error) {
        onErrorRef.current('Could not get buildings. \r\n' + error);
        console.error('Error fetching buildings:', error);
      }
      if (mounted) await fetchData();
    }

    loadInitialData();
    return () => {
      mounted = false;
    };
  }, [user, fetchData]);

  const filteredData = useMemo(
    () =>
      data.filter(
        (item: CategoryProps) => item.id !== CATEGORY_IDS.WELCOME_BASKET,
      ),
    [data],
  );

  return {
    data,
    welcomeBasketData,
    filteredData,
    buildings,
    unitNumberValues,
    setUnitNumberValues,
    checkoutItems,
    setCheckoutItems,
    fetchData,
  };
}
