import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';
import UpdateItemModal from './UpdateItemModal';
import { InventoryItem, CategoryItem } from '../../types/interfaces';
import { UserContext, UserContextType } from '../contexts/UserContext';

const mockFetch = vi.fn();
global.fetch = mockFetch as Mock;

const mockInventoryData: InventoryItem[] = [
  {
    id: 1,
    name: 'Existing Item 1',
    type: 'Donation',
    description: 'Existing description 1',
    quantity: 10,
    category: 'Electronics',
    status: 'Normal Stock'
  }
];

const mockCategoryData: CategoryItem[] = [
  { id: 1, name: 'Electronics', item_limit: 10 },
  { id: 2, name: 'Clothing', item_limit: 20 },
  { id: 3, name: 'Food', item_limit: 15 }
];

const mockUserContext: UserContextType = {
  user: { userDetails: 'test@example.com', userID: '123', userRoles: ['admin'] },
  setUser: vi.fn(),
  loggedInUserId: 1,
  setLoggedInUserId: vi.fn(),
  activeVolunteers: [],
  setActiveVolunteers: vi.fn()
};

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <UserContext.Provider value={mockUserContext}>
      {component}
    </UserContext.Provider>
  );
};

describe('UpdateItemModal Component', () => {
  const mockProps = {
    addModal: true,
    handleAddClose: vi.fn(),
    fetchData: vi.fn(),
    categoryData: mockCategoryData,
    originalData: mockInventoryData
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({})
    });
  });

  test('renders modal when open', () => {
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    expect(screen.getByText('Add/Update Item')).toBeInTheDocument();
    expect(screen.getByText('Name (Click the item from the dropdown if you want to update!)')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  test('does not render modal when closed', () => {
    renderWithContext(<UpdateItemModal {...mockProps} addModal={false} />);
    
    expect(screen.queryByText('Add/Update Item')).not.toBeInTheDocument();
  });

  test('handles input changes for text fields', () => {
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    const descriptionContainer = document.querySelector('#add-item-description');
    const descriptionField = descriptionContainer!.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.change(descriptionField, { target: { value: 'New description' } });
    
    expect(descriptionField).toHaveValue('New description');
    
    const quantityField = screen.getByRole('spinbutton');
    fireEvent.change(quantityField, { target: { value: '15' } });
    
    expect(quantityField).toHaveValue(15);
  });

  test('renders type dropdown options', async () => {
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    const typeContainer = document.querySelector('#add-item-type');
    const typeSelect = typeContainer!.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.mouseDown(typeSelect);
    
    await waitFor(() => {
      expect(screen.getByText('Donation')).toBeInTheDocument();
      expect(screen.getByText('Welcome Basket')).toBeInTheDocument();
    });
  });

  test('renders category options from categoryData', async () => {
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    const categoryContainer = document.querySelector('#add-item-category');
    const categorySelect = categoryContainer!.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.mouseDown(categorySelect);
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
  });

  test('handles autocomplete search and filtering', async () => {
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    const nameContainer = document.querySelector('#add-item-name');
    const nameInput = nameContainer!.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Existing' } });
    
    await waitFor(() => {
      expect(screen.getByText('Existing Item 1')).toBeInTheDocument();
    });
  });

  test('shows default create button for new items', () => {
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  test('shows error message for missing information on create', async () => {
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    const createButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Missing Information')).toBeInTheDocument();
    });
  });

  test('calls cancel handler and resets form', () => {
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    const nameContainer = document.querySelector('#add-item-name');
    const nameInput = nameContainer!.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    expect(mockProps.handleAddClose).toHaveBeenCalled();
  });

  test('clears name search when input is empty', async () => {
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    const nameContainer = document.querySelector('#add-item-name');
    const nameInput = nameContainer!.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'test' } });
    fireEvent.change(nameInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Existing Item 1')).not.toBeInTheDocument();
    });
  });

  test('handles API error during creation', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Creation failed'));
    
    renderWithContext(<UpdateItemModal {...mockProps} />);
    
    const nameContainer = document.querySelector('#add-item-name');
    const nameInput = nameContainer!.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Test Item' } });
    
    const descriptionContainer = document.querySelector('#add-item-description');
    const descriptionField = descriptionContainer!.querySelector('input[type="text"]') as HTMLInputElement;
    fireEvent.change(descriptionField, { target: { value: 'New test description' } });
    
    const quantityField = screen.getByRole('spinbutton');
    fireEvent.change(quantityField, { target: { value: '20' } });
    
    // Select type and category
    const typeContainer = document.querySelector('#add-item-type');
    const typeSelect = typeContainer!.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.mouseDown(typeSelect);
    fireEvent.click(screen.getByText('Donation'));
    
    const categoryContainer = document.querySelector('#add-item-category');
    const categorySelect = categoryContainer!.querySelector('[role="combobox"]') as HTMLElement;
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(screen.getByText('Electronics'));
    
    const createButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Error: Creation failed/)).toBeInTheDocument();
    });
  });
});