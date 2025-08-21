import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import InventoryTable from './InventoryTable';
import { InventoryItem } from '../../types/interfaces';

const mockInventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: 'Test Item 1',
    description: 'This is a test description for item 1',
    type: 'General',
    category: 'Electronics',
    status: 'Out of Stock',
    quantity: 0
  },
  {
    id: 2,
    name: 'Test Item 2',
    description: 'This is a test description for item 2',
    type: 'Welcome Basket',
    category: 'Clothing',
    status: 'Low Stock',
    quantity: 3
  },
  {
    id: 3,
    name: 'Test Item 3',
    description: 'This is a test description for item 3',
    type: 'General',
    category: 'Food',
    status: 'Normal Stock',
    quantity: 25
  }
];

describe('InventoryTable Component', () => {
  const mockProps = {
    currentItems: mockInventoryItems,
    sortDirection: 'original' as const,
    handleSort: vi.fn()
  };

  test('renders table with headers', () => {
    render(<InventoryTable {...mockProps} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  test('renders all inventory items', () => {
    render(<InventoryTable {...mockProps} />);
    
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('Test Item 3')).toBeInTheDocument();
    
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    
    expect(screen.getAllByText('General')).toHaveLength(2);
    expect(screen.getByText('Welcome Basket')).toBeInTheDocument();
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  test('renders status chips with correct colors', () => {
    render(<InventoryTable {...mockProps} />);
    
    const outOfStockChip = screen.getByText('Out of Stock');
    const lowStockChip = screen.getByText('Low Stock');
    const normalStockChip = screen.getByText('Normal Stock');
    
    expect(outOfStockChip).toBeInTheDocument();
    expect(lowStockChip).toBeInTheDocument();
    expect(normalStockChip).toBeInTheDocument();
    
    expect(outOfStockChip.closest('.MuiChip-root')).toHaveStyle({
      backgroundColor: '#FDECEA',
      color: '#D32F2F'
    });
    
    expect(lowStockChip.closest('.MuiChip-root')).toHaveStyle({
      backgroundColor: '#FFF9C4',
      color: '#6A4E23'
    });
    
    expect(normalStockChip.closest('.MuiChip-root')).toHaveStyle({
      backgroundColor: '#E6F4EA',
      color: '#357A38'
    });
  });

  test('calls handleSort when name header is clicked', () => {
    render(<InventoryTable {...mockProps} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    expect(mockProps.handleSort).toHaveBeenCalled();
  });

  test('displays correct sort icon for ascending order', () => {
    const propsWithAscSort = {
      ...mockProps,
      sortDirection: 'asc' as const
    };
    
    render(<InventoryTable {...propsWithAscSort} />);
    
    expect(screen.getByTestId('ArrowUpwardIcon')).toBeInTheDocument();
  });

  test('displays correct sort icon for descending order', () => {
    const propsWithDescSort = {
      ...mockProps,
      sortDirection: 'desc' as const
    };
    
    render(<InventoryTable {...propsWithDescSort} />);
    
    expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument();
  });

  test('displays no sort icon for original order', () => {
    render(<InventoryTable {...mockProps} />);
    
    expect(screen.queryByTestId('ArrowUpwardIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ArrowDownwardIcon')).not.toBeInTheDocument();
  });

  test('renders tooltips for descriptions', () => {
    render(<InventoryTable {...mockProps} />);
    
    const descriptionCell = screen.getByText('This is a test description for item 1');
    expect(descriptionCell).toBeInTheDocument();
    
    const tooltipSpan = descriptionCell.closest('span');
    expect(tooltipSpan).toBeInTheDocument();
  });

  test('displays "No items to display" when currentItems is empty', () => {
    const propsWithEmptyItems = {
      ...mockProps,
      currentItems: []
    };
    
    render(<InventoryTable {...propsWithEmptyItems} />);
    
    expect(screen.getByText('No items to display')).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
  });

  test('displays "No items to display" when currentItems is null', () => {
    const propsWithNullItems = {
      ...mockProps,
      currentItems: null as any
    };
    
    render(<InventoryTable {...propsWithNullItems} />);
    
    expect(screen.getByText('No items to display')).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
  });

  test('handles long descriptions with ellipsis', () => {
    const itemsWithLongDescription: InventoryItem[] = [
      {
        id: 1,
        name: 'Test Item',
        description: 'This is a very long description that should be truncated with ellipsis in the table cell to prevent layout issues',
        type: 'General',
        category: 'Test Category',
        status: 'Normal Stock',
        quantity: 10
      }
    ];
    
    const propsWithLongDescription = {
      ...mockProps,
      currentItems: itemsWithLongDescription
    };
    
    render(<InventoryTable {...propsWithLongDescription} />);
    
    const descriptionCell = screen.getByText('This is a very long description that should be truncated with ellipsis in the table cell to prevent layout issues');
    const tableCell = descriptionCell.closest('td');
    
    expect(tableCell).toHaveStyle({
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    });
  });

  test('applies correct table layout styles', () => {
    render(<InventoryTable {...mockProps} />);
    
    const table = screen.getByRole('table');
    expect(table).toHaveStyle({
      tableLayout: 'fixed'
    });
  });

  test('name header has cursor pointer style', () => {
    render(<InventoryTable {...mockProps} />);
    
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveStyle({
      cursor: 'pointer'
    });
  });

  test('renders table rows with correct height', () => {
    render(<InventoryTable {...mockProps} />);
    
    const tableRows = screen.getAllByRole('row');
    
    const headerRow = tableRows[0];
    expect(headerRow).toHaveStyle({
      height: '64px'
    });
    
    const dataRows = tableRows.slice(1);
    dataRows.forEach(row => {
      expect(row).toHaveStyle({
        height: '64px'
      });
    });
  });
});