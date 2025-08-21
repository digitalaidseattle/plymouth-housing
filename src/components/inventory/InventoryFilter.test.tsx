import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import InventoryFilter from './InventoryFilter';
import { CategoryItem } from '../../types/interfaces';

const mockCategoryData: CategoryItem[] = [
  { id: 1, name: 'Electronics', item_limit: 10 },
  { id: 2, name: 'Clothing', item_limit: 20 },
  { id: 3, name: 'Food', item_limit: 15 }
];

describe('InventoryFilter Component', () => {
  const mockProps = {
    filters: {
      type: '',
      category: '',
      status: '',
      search: ''
    },
    anchors: {
      type: null as HTMLElement | null,
      category: null as HTMLElement | null,
      status: null as HTMLElement | null
    },
    categoryData: mockCategoryData,
    handleFilterClick: vi.fn(),
    handleMenuClick: vi.fn(),
    clearFilter: vi.fn(),
    handleSearch: vi.fn()
  };

  test('renders filter components', () => {
    render(<InventoryFilter {...mockProps} />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  test('calls handleFilterClick when type button is clicked', () => {
    render(<InventoryFilter {...mockProps} />);
    
    const typeButton = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('Type')
    );
    fireEvent.click(typeButton!);
    
    expect(mockProps.handleFilterClick).toHaveBeenCalledWith('type', expect.any(Object));
  });

  test('calls handleFilterClick when category button is clicked', () => {
    render(<InventoryFilter {...mockProps} />);
    
    const categoryButton = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('Category')
    );
    fireEvent.click(categoryButton!);
    
    expect(mockProps.handleFilterClick).toHaveBeenCalledWith('category', expect.any(Object));
  });

  test('calls handleFilterClick when status button is clicked', () => {
    render(<InventoryFilter {...mockProps} />);
    
    const statusButton = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('Status')
    );
    fireEvent.click(statusButton!);
    
    expect(mockProps.handleFilterClick).toHaveBeenCalledWith('status', expect.any(Object));
  });

  test('displays selected type filter with clear button', () => {
    const propsWithTypeFilter = {
      ...mockProps,
      filters: { ...mockProps.filters, type: 'General' }
    };
    
    render(<InventoryFilter {...propsWithTypeFilter} />);
    
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
  });

  test('displays selected category filter with clear button', () => {
    const propsWithCategoryFilter = {
      ...mockProps,
      filters: { ...mockProps.filters, category: 'Electronics' }
    };
    
    render(<InventoryFilter {...propsWithCategoryFilter} />);
    
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
  });

  test('displays selected status filter with clear button', () => {
    const propsWithStatusFilter = {
      ...mockProps,
      filters: { ...mockProps.filters, status: 'Low Stock' }
    };
    
    render(<InventoryFilter {...propsWithStatusFilter} />);
    
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
  });

  test('calls clearFilter when clear button is clicked for type', () => {
    const propsWithTypeFilter = {
      ...mockProps,
      filters: { ...mockProps.filters, type: 'General' }
    };
    
    render(<InventoryFilter {...propsWithTypeFilter} />);
    
    const clearButton = screen.getByTestId('ClearIcon');
    fireEvent.click(clearButton);
    
    expect(mockProps.clearFilter).toHaveBeenCalledWith('type');
  });

  test('calls clearFilter when clear button is clicked for category', () => {
    const propsWithCategoryFilter = {
      ...mockProps,
      filters: { ...mockProps.filters, category: 'Electronics' }
    };
    
    render(<InventoryFilter {...propsWithCategoryFilter} />);
    
    const clearButton = screen.getByTestId('ClearIcon');
    fireEvent.click(clearButton);
    
    expect(mockProps.clearFilter).toHaveBeenCalledWith('category');
  });

  test('calls clearFilter when clear button is clicked for status', () => {
    const propsWithStatusFilter = {
      ...mockProps,
      filters: { ...mockProps.filters, status: 'Low Stock' }
    };
    
    render(<InventoryFilter {...propsWithStatusFilter} />);
    
    const clearButton = screen.getByTestId('ClearIcon');
    fireEvent.click(clearButton);
    
    expect(mockProps.clearFilter).toHaveBeenCalledWith('status');
  });

  test('renders type menu options when anchor is set', () => {
    const mockElement = document.createElement('button');
    const propsWithAnchor = {
      ...mockProps,
      anchors: { ...mockProps.anchors, type: mockElement }
    };
    
    render(<InventoryFilter {...propsWithAnchor} />);
    
    expect(screen.getByRole('menuitem', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Welcome Basket' })).toBeInTheDocument();
  });

  test('renders category menu options when anchor is set', () => {
    const mockElement = document.createElement('button');
    const propsWithAnchor = {
      ...mockProps,
      anchors: { ...mockProps.anchors, category: mockElement }
    };
    
    render(<InventoryFilter {...propsWithAnchor} />);
    
    expect(screen.getByRole('menuitem', { name: 'Electronics' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Clothing' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Food' })).toBeInTheDocument();
  });

  test('renders status menu options when anchor is set', () => {
    const mockElement = document.createElement('button');
    const propsWithAnchor = {
      ...mockProps,
      anchors: { ...mockProps.anchors, status: mockElement }
    };
    
    render(<InventoryFilter {...propsWithAnchor} />);
    
    expect(screen.getByRole('menuitem', { name: 'Out of Stock' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Low Stock' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Normal Stock' })).toBeInTheDocument();
  });

  test('calls handleMenuClick when type menu item is clicked', () => {
    const mockElement = document.createElement('button');
    const propsWithAnchor = {
      ...mockProps,
      anchors: { ...mockProps.anchors, type: mockElement }
    };
    
    render(<InventoryFilter {...propsWithAnchor} />);
    
    const generalOption = screen.getByRole('menuitem', { name: 'General' });
    fireEvent.click(generalOption);
    
    expect(mockProps.handleMenuClick).toHaveBeenCalledWith('type', 'General');
  });

  test('calls handleMenuClick when category menu item is clicked', () => {
    const mockElement = document.createElement('button');
    const propsWithAnchor = {
      ...mockProps,
      anchors: { ...mockProps.anchors, category: mockElement }
    };
    
    render(<InventoryFilter {...propsWithAnchor} />);
    
    const electronicsOption = screen.getByRole('menuitem', { name: 'Electronics' });
    fireEvent.click(electronicsOption);
    
    expect(mockProps.handleMenuClick).toHaveBeenCalledWith('category', 'Electronics');
  });

  test('calls handleMenuClick when status menu item is clicked', () => {
    const mockElement = document.createElement('button');
    const propsWithAnchor = {
      ...mockProps,
      anchors: { ...mockProps.anchors, status: mockElement }
    };
    
    render(<InventoryFilter {...propsWithAnchor} />);
    
    const lowStockOption = screen.getByRole('menuitem', { name: 'Low Stock' });
    fireEvent.click(lowStockOption);
    
    expect(mockProps.handleMenuClick).toHaveBeenCalledWith('status', 'Low Stock');
  });

  test('calls handleSearch when search input changes', () => {
    render(<InventoryFilter {...mockProps} />);
    
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(mockProps.handleSearch).toHaveBeenCalledWith('test search');
  });

  test('displays current search value', () => {
    const propsWithSearch = {
      ...mockProps,
      filters: { ...mockProps.filters, search: 'current search' }
    };
    
    render(<InventoryFilter {...propsWithSearch} />);
    
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveValue('current search');
  });

  test('calls handleMenuClick to close menu when menu background is clicked', () => {
    const mockElement = document.createElement('button');
    const propsWithAnchor = {
      ...mockProps,
      anchors: { ...mockProps.anchors, type: mockElement }
    };
    
    render(<InventoryFilter {...propsWithAnchor} />);
    
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape' });
    
    expect(mockProps.handleMenuClick).toHaveBeenCalledWith('type', '');
  });
});