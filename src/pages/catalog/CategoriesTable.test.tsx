import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import CategoriesTable from './CategoriesTable';
import { CategoryItem } from '../../types/interfaces';

describe('CategoriesTable Component', () => {
  const mockCategories: CategoryItem[] = [
    { id: 1, name: 'Food', item_limit: 3 },
    { id: 2, name: 'Hygiene', item_limit: 5 },
  ];

  const mockHandlers = {
    onUpdate: vi.fn().mockResolvedValue(true),
    onCreate: vi.fn().mockResolvedValue(true),
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  test('renders category list', () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Hygiene')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('renders add category button', () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
  });

  test('shows add category form when button clicked', () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));

    expect(screen.getAllByPlaceholderText('Category name')).toHaveLength(1);
  });

  test('creates new category successfully', async () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));

    const nameInput = screen.getByPlaceholderText('Category name');
    const limitInputs = screen.getAllByDisplayValue('1');

    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    fireEvent.change(limitInputs[0], { target: { value: '2' } });

    const checkButtons = screen.getAllByRole('button');
    const checkButton = checkButtons[checkButtons.length - 2]; // Check button is second to last
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockHandlers.onCreate).toHaveBeenCalledWith({
        name: 'New Category',
        item_limit: 2,
      });
      expect(mockHandlers.onSuccess).toHaveBeenCalledWith('Category created successfully');
    });
  });

  test('shows error when creating category with empty name', async () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));

    const checkButtons = screen.getAllByRole('button');
    const checkButton = checkButtons[checkButtons.length - 2]; // Check button is second to last
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockHandlers.onError).toHaveBeenCalledWith('Category name cannot be empty');
    });
  });

  test('shows error when creating category with invalid item limit', async () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));

    const nameInput = screen.getByPlaceholderText('Category name');
    const limitInputs = screen.getAllByDisplayValue('1');

    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    fireEvent.change(limitInputs[0], { target: { value: '0' } });

    const checkButtons = screen.getAllByRole('button');
    const checkButton = checkButtons[checkButtons.length - 2]; // Check button is second to last
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockHandlers.onError).toHaveBeenCalledWith('Item limit must be a positive number');
    });
  });

  test('cancels adding new category', () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));
    expect(screen.getByPlaceholderText('Category name')).toBeInTheDocument();

    const allButtons = screen.getAllByRole('button');
    const closeButton = allButtons[allButtons.length - 1]; // Close button is last
    fireEvent.click(closeButton);

    expect(screen.queryByPlaceholderText('Category name')).not.toBeInTheDocument();
  });

  test('edits category name', async () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    const foodCell = screen.getByText('Food');
    fireEvent.click(foodCell);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Food');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'Groceries' } });
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith(1, { name: 'Groceries' });
      expect(mockHandlers.onSuccess).toHaveBeenCalledWith('Category updated successfully');
    });
  });

  test('edits category item limit', async () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    const limitCell = screen.getByText('3');
    fireEvent.click(limitCell);

    await waitFor(() => {
      const input = screen.getByDisplayValue('3');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: '10' } });
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith(1, { item_limit: 10 });
      expect(mockHandlers.onSuccess).toHaveBeenCalledWith('Category updated successfully');
    });
  });

  test('shows error when editing category name to empty', async () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    const foodCell = screen.getByText('Food');
    fireEvent.click(foodCell);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Food');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(mockHandlers.onError).toHaveBeenCalledWith('Category name cannot be empty');
    });
  });

  test('displays empty state when no categories', () => {
    render(<CategoriesTable categories={[]} {...mockHandlers} />);

    expect(screen.getByText('No categories found')).toBeInTheDocument();
  });

  test('handles Enter key to save edit', async () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    const foodCell = screen.getByText('Food');
    fireEvent.click(foodCell);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Food');
      fireEvent.change(input, { target: { value: 'Groceries' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });

    await waitFor(() => {
      expect(mockHandlers.onUpdate).toHaveBeenCalledWith(1, { name: 'Groceries' });
    });
  });

  test('handles Escape key to cancel edit', async () => {
    render(<CategoriesTable categories={mockCategories} {...mockHandlers} />);

    const foodCell = screen.getByText('Food');
    fireEvent.click(foodCell);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Food');
      fireEvent.change(input, { target: { value: 'Groceries' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    });

    expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
  });
});
