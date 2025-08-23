
import { render, screen, fireEvent } from '@testing-library/react';
import ItemQuantityButton from './ItemQuantityButton';
import { vi } from 'vitest';

describe('ItemQuantityButton', () => {
  const item = { id: 1, name: 'Test Item', quantity: 1, description: '' };
  const categoryCheckout = { id: 1, category: 'Test Category', items: [], checkout_limit: 2, categoryCount: 1 };
  const addItemToCart = vi.fn();
  const removeItemFromCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (inCart = false, removeButton = false, disableAdd = false) => {
    const currentCategoryCheckout = inCart ? { ...item, quantity: 2 } : categoryCheckout;
    return render(
      <ItemQuantityButton
        item={item}
        categoryCheckout={currentCategoryCheckout}
        addItemToCart={addItemToCart}
        removeItemFromCart={removeItemFromCart}
        removeButton={removeButton}
        disableAdd={disableAdd}
        categoryName="Test Category"
      />
    );
  };

  it('should render the "Add" button', () => {
    renderComponent();
    expect(screen.getByTestId('AddIcon')).not.toBeNull();
  });

  it('should render the "Remove" button and quantity when the item is in the cart', () => {
    renderComponent(true);
    expect(screen.getByTestId('RemoveIcon')).not.toBeNull();
    expect(screen.getByTestId('test-id-quantity')).not.toBeNull();
  });

  it('should call addItemToCart with 1 when the "Add" button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('AddIcon'));
    expect(addItemToCart).toHaveBeenCalledWith(item, 1, 'Test Category');
  });

  it('should call addItemToCart with -1 when the "Remove" button is clicked', () => {
    renderComponent(true);
    fireEvent.click(screen.getByTestId('RemoveIcon'));
    expect(addItemToCart).toHaveBeenCalledWith(item, -1, 'Test Category');
  });

  it('should call removeItemFromCart when the "Remove" button (text) is clicked', () => {
    renderComponent(true, true);
    fireEvent.click(screen.getByText('Remove'));
    expect(removeItemFromCart).toHaveBeenCalledWith(item.id, 'Test Category');
  });

  it('should disable the "Add" button when disableAdd is true', () => {
    renderComponent(false, false, true);
    const addButton = screen.getByTestId('AddIcon').closest('button');
    expect(addButton.hasAttribute('disabled')).toBe(true);
  });
});
