import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import ItemsTable from './ItemsTable';
import { AdminItem, CategoryItem } from '../../types/interfaces';

describe('ItemsTable Component', () => {
  const mockCategories: CategoryItem[] = [
    { id: 1, name: 'Food', item_limit: 3 },
    { id: 2, name: 'Hygiene', item_limit: 5 },
  ];

  const mockItems: AdminItem[] = [
    {
      id: 1,
      name: 'Apples',
      type: 'General',
      category_id: 1,
      category_name: 'Food',
      description: 'Fresh apples',
      quantity: 50,
      threshold: 10,
      items_per_basket: null,
    },
    {
      id: 2,
      name: 'Soap',
      type: 'Welcome Basket',
      category_id: 2,
      category_name: 'Hygiene',
      description: null,
      quantity: 30,
      threshold: 5,
      items_per_basket: 2,
    },
  ];

  const mockHandlers = {
    onUpdate: vi.fn().mockResolvedValue(true),
    onCreate: vi.fn().mockResolvedValue(true),
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  test('renders item list', () => {
    render(
      <ItemsTable
        items={mockItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Apples')).toBeInTheDocument();
    expect(screen.getByText('Soap')).toBeInTheDocument();
    expect(screen.getByText('Fresh apples')).toBeInTheDocument();
  });

  test('renders add item button', () => {
    render(
      <ItemsTable
        items={mockItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  test('shows add item form when button clicked', () => {
    render(
      <ItemsTable
        items={mockItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /add item/i }));

    expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
  });

  test('edits item name', async () => {
    render(
      <ItemsTable
        items={mockItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const applesCell = screen.getByText('Apples');
    fireEvent.click(applesCell);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Apples');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'Green Apples' } });
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith(1, { name: 'Green Apples' });
      expect(mockHandlers.onSuccess).toHaveBeenCalledWith('Item updated successfully');
    });
  });

  test('edits item quantity', async () => {
    render(
      <ItemsTable
        items={mockItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const quantityCell = screen.getByText('50');
    fireEvent.click(quantityCell);

    await waitFor(() => {
      const input = screen.getByDisplayValue('50');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: '100' } });
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith(1, { quantity: 100 });
      expect(mockHandlers.onSuccess).toHaveBeenCalledWith('Item updated successfully');
    });
  });

  test('filters items by search', () => {
    render(
      <ItemsTable
        items={mockItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search items...');
    fireEvent.change(searchInput, { target: { value: 'Apples' } });

    expect(screen.getByText('Apples')).toBeInTheDocument();
    expect(screen.queryByText('Soap')).not.toBeInTheDocument();
  });

  test('filters items by category name', () => {
    render(
      <ItemsTable
        items={mockItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search items...');
    fireEvent.change(searchInput, { target: { value: 'Hygiene' } });

    expect(screen.getByText('Soap')).toBeInTheDocument();
    expect(screen.queryByText('Apples')).not.toBeInTheDocument();
  });

  test('displays empty state when no items match search', () => {
    render(
      <ItemsTable
        items={mockItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search items...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No items match your search')).toBeInTheDocument();
  });

  test('displays empty state when no items', () => {
    render(
      <ItemsTable
        items={[]}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  test('shows error when editing item name to empty', async () => {
    render(
      <ItemsTable
        items={mockItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const applesCell = screen.getByText('Apples');
    fireEvent.click(applesCell);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Apples');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(mockHandlers.onError).toHaveBeenCalledWith('Item name cannot be empty');
    });
  });

  test('handles pagination', () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      type: 'General',
      category_id: 1,
      category_name: 'Food',
      description: null,
      quantity: 10,
      threshold: 5,
      items_per_basket: null,
    }));

    render(
      <ItemsTable
        items={manyItems}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 15')).not.toBeInTheDocument();

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    expect(screen.getByText('Item 11')).toBeInTheDocument();
  });
});
