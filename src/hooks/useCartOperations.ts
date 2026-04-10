import { useState } from 'react';
import { CategoryProps, CheckoutItemProp } from '../types/interfaces';

interface UseCartOperationsProps {
  checkoutItems: CategoryProps[];
  setCheckoutItems: (items: CategoryProps[]) => void;
}

export function useCartOperations({ checkoutItems, setCheckoutItems }: UseCartOperationsProps) {
  // TODO(#445): activeSection locking was designed to prevent mixing general/welcomeBasket items.
  // Now that the checkout page is split into separate pages, this is dead logic and can be removed.
  const [activeSection, setActiveSection] = useState<string>('');

  const addItemToCart = (
    item: CheckoutItemProp,
    quantity: number,
    category: string,
    section: string,
  ) => {
    if (activeSection && activeSection !== section) return;

    const updatedCheckoutItems = [...checkoutItems];
    const categoryIndex = updatedCheckoutItems.findIndex(
      (cat: CategoryProps) => cat.category === category,
    );

    if (categoryIndex !== -1) {
      const categoryData = updatedCheckoutItems[categoryIndex];
      const categoryItems = [...categoryData.items];
      const itemIndex = categoryItems.findIndex(
        (addedItem: CheckoutItemProp) => addedItem.id === item.id,
      );

      if (itemIndex !== -1) {
        const foundItem = categoryItems[itemIndex];
        // quantity can be negative (decrement); remove item entirely if it reaches 0
        const newQuantity = foundItem.quantity + quantity;
        if (newQuantity <= 0) {
          categoryItems.splice(itemIndex, 1);
        } else {
          categoryItems[itemIndex] = { ...foundItem, quantity: newQuantity };
        }
      } else if (quantity > 0) {
        categoryItems.push({ ...item, quantity });
        setActiveSection(section);
      }

      const newCategoryCount = categoryItems.reduce(
        (acc, currentItem) => acc + currentItem.quantity,
        0,
      );
      updatedCheckoutItems[categoryIndex] = {
        ...categoryData,
        items: categoryItems,
        categoryCount: newCategoryCount,
      };
    }

    setCheckoutItems(updatedCheckoutItems);

    const isCartEmpty = updatedCheckoutItems.every((cat) => cat.items.length === 0);
    if (isCartEmpty) setActiveSection('');
  };

  // Removes the item entirely from the cart regardless of its current quantity (a "delete row" action,
  // distinct from addItemToCart which decrements one at a time).
  const removeItemFromCart = (itemId: number, categoryName: string) => {
    const updatedCheckoutItems = checkoutItems.map((category) => {
      if (category.category !== categoryName) return category;

      const updatedItems = category.items.filter(
        (addedItem: CheckoutItemProp) => addedItem.id !== itemId,
      );
      return {
        ...category,
        items: updatedItems,
        categoryCount: updatedItems.reduce((count, item) => count + item.quantity, 0),
      };
    });

    const isCartEmpty = updatedCheckoutItems.every((category) => category.items.length === 0);
    if (isCartEmpty) setActiveSection('');

    setCheckoutItems(updatedCheckoutItems);
  };

  return { activeSection, setActiveSection, addItemToCart, removeItemFromCart };
}
