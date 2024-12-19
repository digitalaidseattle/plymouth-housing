import { render, screen, waitFor } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { UserContext } from '../../components/contexts/UserContext';


// Mock categories
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
  ]
}));

describe('CheckoutPage', () => {

  // it('renders the checkout page correctly', () => {
  //   render(<CheckoutPage />);
  //   // Check if the heading is rendered
  //   expect(screen.getByText(/Check out/i)).toBeInTheDocument();

  //   // Check if categories and items are rendered
  //   expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
  //   expect(screen.getByText(/Laptop/i)).toBeInTheDocument();
  //   expect(screen.getByText(/Phone/i)).toBeInTheDocument();
  // });

  it('renders building dropdown and handles API response', async () => {
    // Mock fetch for buildings API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            value: [
              { code: 'B1', name: 'Building 1' },
              { code: 'B2', name: 'Building 2' },
            ],
          }),
      }),
    )as unknown as typeof fetch;

    const mockUser = { role: 'admin', name: 'Admin User', email: 'admin@example.com' }; // Add required properties
    render(
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
    );    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Ensure dropdown is rendered
    const dropdown = screen.getByTestId('test-id-select-building-code');
    expect(dropdown).toBeInTheDocument();

    // Assert mocked data renders correctly
    expect(await screen.findByText('B1 (Building 1)')).toBeInTheDocument();
    expect(await screen.findByText('B2 (Building 2)')).toBeInTheDocument();
  });

  // it('adds an item to the cart and shows item quantity', () => {
  //   // Check if the cart is initially empty (no summary button visible)
  //   expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();

  //   // Add item to the cart
  //   const addItemButton = screen.getAllByTestId('AddIcon')[0];
  //   fireEvent.click(addItemButton);

  //   // Check if the quantity is updated and item is added to the cart
  //   expect(screen.getByText('1 items selected')).toBeInTheDocument();
  //   expect(screen.getByTestId('test-id-quantity')); // Check for quantity
  // });

  // it('removes an item from the cart', () => {
  //   // Add item to the cart
  //   const addItemButton = screen.getAllByTestId('AddIcon')[0];
  //   fireEvent.click(addItemButton);

  //   // Check if the item is added
  //   expect(screen.getByText('1 items selected')).toBeInTheDocument();

  //   // Remove the item
  //   const removeItemButton = screen.getAllByTestId('RemoveIcon')[0];
  //   fireEvent.click(removeItemButton);

  //   // Check if the cart is empty again
  //   expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();
  // });

  // it('shows checkout dialog when "Continue" is clicked', () => {
  //   // Add item to the cart
  //   const addItemButton = screen.getAllByTestId('AddIcon')[0];
  //   fireEvent.click(addItemButton);

  //   // Click the continue button to open the checkout dialog
  //   const continueButton = screen.getByText(/Continue/i);
  //   fireEvent.click(continueButton);

  //   // Check if the checkout dialog is open
  //   expect(screen.getByText(/Checkout Summary/i)).toBeInTheDocument();
  // });
});
