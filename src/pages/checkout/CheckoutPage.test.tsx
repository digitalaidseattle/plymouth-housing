import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { UserContext } from '../../components/contexts/UserContext';
import { act } from 'react-dom/test-utils';


// Mock categories and welcomeBasketData
vi.mock('../../data/checkoutPage', () => ({
  categories: [
    {
      id: 1,
      name: 'Electronics',
      items: [
        { id: 'item1', name: 'Laptop' },
        { id: 'item2', name: 'Phone' },
      ],
    },
  ],
  welcomeBasketData: [
    {
      id: 1,
      category: '',
      items: [
        { id: 3241, name: 'Full Set', quantity: 5 },
        { id: 3242, name: 'Twin Set', quantity: 19 },
      ],
    },
  ],
}));

vi.mock('../../types/constants', () => ({
  ENDPOINTS: {
    BUILDINGS: '/mock/buildings',
    CATEGORIZED_ITEMS: '/mock/items',
  },
  HEADERS: {
    'X-MS-API-ROLE': '',
    'Content-Type': 'application/json',
  },
}));

global.fetch = vi.fn((url) => {
  console.log('fetch', url);
  if (url === '/mock/buildings') {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        value: [
          { id: 1, name: 'Building A', code: 'A'},
          { id: 2, name: 'Building B', code: 'B' },
        ],
      }),
    });
  }
  if (url === '/mock/items') {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        value: [
          { id: 1, category: 'Electronics', items: [{ id: 101, name: 'Laptop', quantity: 5 }] },
          { id: 2, category: 'Furniture', items: [{ id: 201, name: 'Chair', quantity: 10 }] },
        ],
      }),
    });
  }
  return { ok: false, statusText: 'Not Found' };
});

describe('CheckoutPage', () => {
  beforeEach(() => {
    const mockUser = { roles: ['admin'], name: 'Admin User', email: 'admin@example.com' }; 
    act(()=>{render(
        <UserContext.Provider value={{ 
          user: mockUser, 
          setUser: vi.fn(), 
          loggedInVolunteer: null, 
          setLoggedInVolunteer: vi.fn(), 
          activeVolunteers: [], 
          setActiveVolunteers: vi.fn() 
        }}>
          <CheckoutPage />
        </UserContext.Provider>,
      );    
    });
  });

  it('renders the checkout page correctly', () => {
    // Check if categories and items are rendered
    expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
    expect(screen.getByText(/Laptop/i)).toBeInTheDocument();
    expect(screen.getByText(/Furniture/i)).toBeInTheDocument();
  });

  it('renders building dropdown and handles API response', async () => {
    // Ensure dropdown is rendered
    const dropdown = screen.getByTestId('test-id-select-building-code');
    expect(dropdown).toBeInTheDocument();
    act(() => {
      fireEvent.click(dropdown);
    });

    // Assert mocked data renders correctly
    expect(await screen.findByText('Building')).toBeInTheDocument();
//    expect(await screen.findByText('B2 (Building 2)')).toBeInTheDocument();
  });

  it('adds an item to the cart and shows item quantity', () => {
    // Check if the cart is initially empty (no summary button visible)
    expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();

    // Add item to the cart
    const addItemButton = screen.getAllByTestId('AddIcon')[0];
    fireEvent.click(addItemButton);

    // Check if the quantity is updated and item is added to the cart
    expect(screen.getByText('1 items selected')).toBeInTheDocument();
    expect(screen.getByTestId('test-id-quantity')); // Check for quantity
  });

  it('removes an item from the cart', () => {
    // Add item to the cart
    const addItemButton = screen.getAllByTestId('AddIcon')[0];
    fireEvent.click(addItemButton);

    // Check if the item is added
    expect(screen.getByText('1 items selected')).toBeInTheDocument();

    // Remove the item
    const removeItemButton = screen.getAllByTestId('RemoveIcon')[0];
    fireEvent.click(removeItemButton);

    // Check if the cart is empty again
    expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();
  });

  it('shows checkout dialog when "Continue" is clicked', () => {
    // Add item to the cart
    const addItemButton = screen.getAllByTestId('AddIcon')[0];
    fireEvent.click(addItemButton);

    // Click the continue button to open the checkout dialog
    const continueButton = screen.getByText(/Continue/i);
    fireEvent.click(continueButton);

    // Check if the checkout dialog is open
    expect(screen.getByText(/Checkout Summary/i)).toBeInTheDocument();
  });
});
