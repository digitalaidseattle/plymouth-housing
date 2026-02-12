import { render, screen, fireEvent, act } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import '@testing-library/jest-dom';
import { UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS } from '../../types/constants';
import { BrowserRouter } from 'react-router-dom';

const mockUserContext = {
  user: { id: 1, userDetails: 'Test User', userRoles: ['volunteer'], userID: "bob" },
  setUser: vi.fn(),
  loggedInUserId: null,
  setLoggedInUserId: vi.fn(),
  activeVolunteers: [],
  setActiveVolunteers: vi.fn(),
  isLoading: false
};

describe('CheckoutPage', async () => {
  beforeEach(async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes(ENDPOINTS.BUILDINGS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              { id: 1, name: 'Building 1', code: 'B1' },
              { id: 2, name: 'Building 2', code: 'B2' },
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.CHECKOUT_WELCOME_BASKET)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [{
              user_id: 'teststring',
              mattress_size: 'teststring',
              quantity: 1,
              resident_id: 1,
              message: "",}
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.CATEGORIZED_ITEMS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              {
                id: 1,
                category: 'Electronics',
                items: [
                  { id: 1, name: 'Laptop', quantity: 1 },
                  { id: 2, name: 'Phone', quantity: 1 },
                ],
              },
              {
                id: 2,
                category: 'Welcome Basket',
                items: [
                  { id: 162, name: 'Full-size sheet set' },
                  { id: 163, name: 'Twin size sheet set' },
                ],
              },
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.UNITS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              { id: 1, building_id: 1, unit_number: "201" },
              { id: 2, building_id: 1, unit_number: "202" },
              { id: 3, building_id: 1, unit_number: "203" },
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.CHECK_PAST_CHECKOUT)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              { id: 1, item_id: 1, quantity: 1, transaction_id: 'teststring', additional_notes: 'teststring' }
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.RESIDENTS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              { id: 1, name: 'teststring', unit_id: 'teststring' },
              { id: 2, name: 'teststring', unit_id: 'teststring' },
            ],
          }),
        });
      } 
      return Promise.reject(new Error('Unknown endpoint'));
    }) as Mock;
    await act(async () => {
      render(
        <BrowserRouter>
          <UserContext.Provider value={mockUserContext}>
            <CheckoutPage />
          </UserContext.Provider>
        </BrowserRouter>
      );
    });
  });

  it('renders the checkout page correctly', async () => {

    // Check if categories and items are rendered
    expect(screen.getAllByText(/Electronics/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Laptop/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone/i)).toBeInTheDocument();
  });

  it('renders the building code select with correct label', () => {
    expect(screen.getByLabelText('Building Code')).toBeInTheDocument();
  });

  it('updates selected value when a building is chosen', async () => {
    const select = screen.getByLabelText('Building Code');

    // Open the dropdown
    fireEvent.mouseDown(select);

    // Click the first option
    const firstOption = screen.getByText('B1 (Building 1)');
    fireEvent.click(firstOption);

    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes[0]).toHaveValue('B1 (Building 1)');
  });

  it('adds an item to the cart and shows item quantity', () => {
    // Check if the cart is initially empty (no summary button visible)
    expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();

    // Add item to the cart
    const addItemButton = screen.getAllByTestId('AddIcon')[0];
    fireEvent.click(addItemButton);

    // Check if the quantity is updated and item is added to the cart
    expect(screen.getByText(`1 / 10 items added`)).toBeInTheDocument();
    expect(screen.getByTestId('test-id-quantity')); // Check for quantity
  });

  it('removes an item from the cart', () => {
    // Add item to the cart
    const addItemButton = screen.getAllByTestId('AddIcon')[0];
    fireEvent.click(addItemButton);

    // Check if the item is added
    expect(screen.getByText(`1 / 10 items added`)).toBeInTheDocument();

    // Remove the item
    const removeItemButton = screen.getAllByTestId('RemoveIcon')[0];
    fireEvent.click(removeItemButton);

    // Check if the cart is empty again
    expect(screen.queryByText(/items added/i)).not.toBeInTheDocument();
  });


  // it('shows checkout dialog when "Continue" is clicked', () => {

  //   const select = screen.getByLabelText('Building Code');

  //   // Open the dropdown
  //   fireEvent.mouseDown(select);

  //   // Click the first option
  //   const firstOption = screen.getByText('B1 (Building 1)');
  //   fireEvent.click(firstOption);

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

describe('CheckoutPage - Welcome Basket Mode', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test to prevent cached data interference
    sessionStorage.clear();
  });

  it('renders welcome basket items when category exists', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes(ENDPOINTS.BUILDINGS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              { id: 1, name: 'Building 1', code: 'B1' },
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.CATEGORIZED_ITEMS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              {
                id: 2,
                category: 'Welcome Basket',
                items: [
                  { id: 162, name: 'Full-size sheet set', quantity: 5 },
                  { id: 163, name: 'Twin-size sheet set', quantity: 3 },
                  { id: 164, name: 'Pillow', quantity: 10 },
                ],
              },
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.CHECK_PAST_CHECKOUT)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ value: [] }),
        });
      } else if (url.includes(ENDPOINTS.UNITS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [{ id: 1, building_id: 1, unit_number: "201" }],
          }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }) as Mock;

    await act(async () => {
      render(
        <BrowserRouter>
          <UserContext.Provider value={mockUserContext}>
            <CheckoutPage checkoutType="welcomeBasket" />
          </UserContext.Provider>
        </BrowserRouter>
      );
    });

    // Should show sheet sets and filter out other items
    expect(screen.getByText('Full-size sheet set')).toBeInTheDocument();
    expect(screen.getByText('Twin-size sheet set')).toBeInTheDocument();
    expect(screen.queryByText('Pillow')).not.toBeInTheDocument();
  });

  it('handles missing Welcome Basket category gracefully without crashing', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn((url) => {
      if (url.includes(ENDPOINTS.BUILDINGS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              { id: 1, name: 'Building 1', code: 'B1' },
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.CATEGORIZED_ITEMS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              {
                id: 1,
                category: 'Electronics',
                items: [
                  { id: 1, name: 'Laptop', quantity: 1 },
                ],
              },
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.CHECK_PAST_CHECKOUT)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ value: [] }),
        });
      } else if (url.includes(ENDPOINTS.UNITS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [{ id: 1, building_id: 1, unit_number: "201" }],
          }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }) as Mock;

    let renderError;
    try {
      await act(async () => {
        render(
          <BrowserRouter>
            <UserContext.Provider value={mockUserContext}>
              <CheckoutPage checkoutType="welcomeBasket" />
            </UserContext.Provider>
          </BrowserRouter>
        );
      });
    } catch (error) {
      renderError = error;
    }

    // Should render without throwing errors even when Welcome Basket category is missing
    expect(renderError).toBeUndefined();
    expect(screen.getAllByText('Welcome Basket')[0]).toBeInTheDocument();
    expect(screen.queryByText('Full-size sheet set')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('handles Welcome Basket category with missing items array without crashing', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn((url) => {
      if (url.includes(ENDPOINTS.BUILDINGS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              { id: 1, name: 'Building 1', code: 'B1' },
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.CATEGORIZED_ITEMS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [
              {
                id: 2,
                category: 'Welcome Basket',
                // items array is missing/undefined
              },
            ],
          }),
        });
      } else if (url.includes(ENDPOINTS.CHECK_PAST_CHECKOUT)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ value: [] }),
        });
      } else if (url.includes(ENDPOINTS.UNITS)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            value: [{ id: 1, building_id: 1, unit_number: "201" }],
          }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }) as Mock;

    let renderError;
    try {
      await act(async () => {
        render(
          <BrowserRouter>
            <UserContext.Provider value={mockUserContext}>
              <CheckoutPage checkoutType="welcomeBasket" />
            </UserContext.Provider>
          </BrowserRouter>
        );
      });
    } catch (error) {
      renderError = error;
    }

    // Should render without throwing errors even when items array is missing
    expect(renderError).toBeUndefined();
    expect(screen.getAllByText('Welcome Basket')[0]).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
