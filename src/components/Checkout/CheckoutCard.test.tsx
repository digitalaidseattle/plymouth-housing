import { render, screen } from '@testing-library/react';
import CheckoutCard from './CheckoutCard';
import { vi } from 'vitest';

vi.mock('./ItemQuantityButton', () => ({
  default: ({ disableAdd }: { disableAdd: boolean }) => <button disabled={disableAdd}>Item Quantity Button</button>,
}));

describe('CheckoutCard', () => {
  const item = { id: 1, name: 'Test Item', quantity: 1, description: 'Test Description' };
  const categoryCheckout = { id: 1, category: 'Test Category', items: [], checkout_limit: 2, categoryCount: 1 };
  const addItemToCart = vi.fn();
  const removeItemFromCart = vi.fn();

  const renderComponent = (disableAdd = false, pastCheckout = false) => {
    const checkoutHistory = pastCheckout ? [{ item_id: 1, timesCheckedOut: 3, additionalNotes: '' }] : [];
    return render(
      <CheckoutCard
        item={item}
        categoryCheckout={categoryCheckout}
        addItemToCart={addItemToCart}
        removeItemFromCart={removeItemFromCart}
        removeButton={false}
        categoryLimit={2}
        categoryName="Test Category"
        activeSection=""
        checkoutHistory={checkoutHistory}
      />
    );
  };

  it('should render the item name and description', () => {
    renderComponent();
    expect(screen.getByText('Test Item')).not.toBeNull();
    expect(screen.getByText('Test Description')).not.toBeNull();
  });

  it('should render the ItemQuantityButton component', () => {
    renderComponent();
    expect(screen.getByText('Item Quantity Button')).not.toBeNull();
  });

  it('should display the number of times the item has been checked out', () => {
    renderComponent(false, true);
    expect(screen.getByText('Checked out 3x')).not.toBeNull();
  });
});