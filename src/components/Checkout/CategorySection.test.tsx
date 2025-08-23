
import { render, screen } from '@testing-library/react';
import CategorySection from './CategorySection';
import { vi } from 'vitest';

vi.mock('./CheckoutCard', () => ({
  default: () => <div>Checkout Card</div>,
}));

describe('CategorySection', () => {
  const category = {
    id: 1,
    category: 'Test Category',
    items: [{ id: 1, name: 'Test Item 1', quantity: 1, description: '' }],
    checkout_limit: 2,
    categoryCount: 1,
  };
  const categoryCheckout = {
    id: 1,
    category: 'Test Category',
    items: [],
    checkout_limit: 2,
    categoryCount: 1,
  };
  const addItemToCart = vi.fn();
  const removeItemFromCart = vi.fn();

  const renderComponent = (disabled = false, exceedsLimit = false) => {
    const newCategoryCheckout = { ...categoryCheckout, categoryCount: exceedsLimit ? 3 : 1 };
    return render(
      <CategorySection
        category={category}
        categoryCheckout={newCategoryCheckout}
        addItemToCart={addItemToCart}
        removeItemFromCart={removeItemFromCart}
        removeButton={false}
        disabled={disabled}
        activeSection=""
      />
    );
  };

  it('should render the category title and the number of items in the category', () => {
    renderComponent();
    expect(screen.getByText('Test Category')).not.toBeNull();
    expect(screen.getByText('1 items')).not.toBeNull();
  });

  it('should render the correct number of CheckoutCard components', () => {
    renderComponent();
    expect(screen.getAllByText('Checkout Card')).toHaveLength(1);
  });

  it('should display the checkout limit and the current count', () => {
    renderComponent();
    expect(screen.getByText('1 of 2')).not.toBeNull();
  });

  it('should display an "Exceeds limit" message when the count exceeds the limit', () => {
    renderComponent(false, true);
    expect(screen.getByText('3 of 2 (Exceeds limit)')).not.toBeNull();
  });

  it('should disable the section when the disabled prop is true', () => {
    const { container } = renderComponent(true);
    const section = container.firstChild as HTMLElement;
    const styles = getComputedStyle(section);
    expect(styles.opacity).toBe('0.5');
  });
});
