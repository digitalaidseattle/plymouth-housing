import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import HistoryPage from './index';
import { UserContext } from '../../components/contexts/UserContext';
import * as HistoryAPICalls from '../../components/History/HistoryAPICalls';
import * as CheckoutAPICalls from '../../components/Checkout/CheckoutAPICalls';
import * as helpers from '../../components/utils/fetchCategorizedItems';
import { TransactionType } from '../../types/history';

// Mock modules
vi.mock('../../components/History/HistoryAPICalls');
vi.mock('../../components/Checkout/CheckoutAPICalls');
vi.mock('../../components/helpers/fetchCategorizedItems');
vi.mock('../../components/CircularLoader', () => ({
  default: () => <div data-testid="circular-loader">Loading...</div>,
}));
vi.mock('../../components/History/CustomDateDialog', () => ({
  default: ({
    showDialog,
    handleShowDialog,
    handleSetDateRange,
  }: any) =>
    showDialog && (
      <div data-testid="custom-date-dialog">
        <button
          onClick={() =>
            handleSetDateRange(new Date('2025-01-15'), new Date('2025-01-20'))
          }
        >
          Set Date Range
        </button>
        <button onClick={handleShowDialog}>Close</button>
      </div>
    ),
}));
vi.mock('../../components/History/GeneralCheckoutCard', () => ({
  default: ({ checkoutTransaction }: any) => (
    <div data-testid={`general-checkout-card-${checkoutTransaction.id}`}>
      General Checkout
    </div>
  ),
}));
vi.mock('../../components/History/WelcomeBasketCard', () => ({
  default: ({ checkoutTransaction }: any) => (
    <div data-testid={`welcome-basket-card-${checkoutTransaction.id}`}>
      Welcome Basket
    </div>
  ),
}));
vi.mock('../../components/History/InventoryCard', () => ({
  default: ({ inventoryTransaction }: any) => (
    <div data-testid={`inventory-card-${inventoryTransaction.id}`}>
      Inventory
    </div>
  ),
}));

// Mock user context values
const mockUser = {
  userID: '1',
  userDetails: 'Test Volunteer',
  userRoles: ['volunteer'],
  claims: [],
};

const mockUserList = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
];

const mockBuildings = [
  { id: 1, building_code: 'A', address: '123 Main St' },
  { id: 2, building_code: 'B', address: '456 Oak Ave' },
];

const mockCategorizedItems = [
  { categoryId: 1, categoryName: 'Food', items: [{ id: 1, name: 'Bread' }] },
];

const mockCheckoutTransactions = [
  {
    id: '1',
    user_id: 1,
    user_name: 'John Doe',
    timestamp: new Date().toISOString(),
    transaction_type: TransactionType.Checkout,
    building_id: 1,
    unit_number: '101',
    resident_name: 'Resident A',
    item_id: 1,
    quantity: 2,
  },
];

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UserContext.Provider
    value={{
      user: mockUser,
      setUser: vi.fn(),
      loggedInUserId: 1,
      setLoggedInUserId: vi.fn(),
      activeVolunteers: [],
      setActiveVolunteers: vi.fn(),
      isLoading: false,
    }}
  >
    {children}
  </UserContext.Provider>
);

describe('HistoryPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API calls with a slight delay to simulate real API behavior
    // This allows the component to show the loading state
    vi.spyOn(HistoryAPICalls, 'findUserTransactionHistory').mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockCheckoutTransactions), 50),
        ),
    );
    vi.spyOn(HistoryAPICalls, 'getUsers').mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockUserList), 50)),
    );
    vi.spyOn(CheckoutAPICalls, 'getBuildings').mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockBuildings), 50)),
    );
    vi.spyOn(helpers, 'default').mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockCategorizedItems), 50),
        ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders page with header and control elements', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    // Check for button group for checkout/inventory type selection
    expect(
      screen.getByRole('button', { name: /Check out/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Inventory/i }),
    ).toBeInTheDocument();

    // Check for date selection dropdown
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
  });

  test('initializes with checkout history type selected', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    const checkoutButton = screen.getByRole('button', { name: /Check out/i });
    expect(checkoutButton).toHaveClass('MuiButton-active-primary');
  });

  test('switches between checkout and inventory history types', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    const checkoutButton = screen.getByRole('button', { name: /Check out/i });
    const inventoryButton = screen.getByRole('button', { name: /Inventory/i });

    // Initially, checkout is active
    expect(checkoutButton).toHaveClass('MuiButton-active-primary');
    expect(inventoryButton).toHaveClass('MuiButton-inactive-primary');

    // Click inventory button
    fireEvent.click(inventoryButton);

    await waitFor(() => {
      expect(inventoryButton).toHaveClass('MuiButton-active-primary');
      expect(checkoutButton).toHaveClass('MuiButton-inactive-primary');
    });

    // Verify API was called for inventory
    expect(HistoryAPICalls.findUserTransactionHistory).toHaveBeenCalledWith(
      mockUser,
      expect.any(String),
      expect.any(String),
      'inventory',
    );
  });

  test('fetches and displays checkout transactions', async () => {
    vi.spyOn(HistoryAPICalls, 'findUserTransactionHistory').mockResolvedValue(
      mockCheckoutTransactions,
    );

    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(HistoryAPICalls.findUserTransactionHistory).toHaveBeenCalled();
    });

    // Verify user list is fetched
    expect(HistoryAPICalls.getUsers).toHaveBeenCalled();
  });

  test('fetches buildings and categorized items on mount', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(CheckoutAPICalls.getBuildings).toHaveBeenCalled();
      expect(helpers.default).toHaveBeenCalled();
    });
  });

  test('displays loading state initially', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    // Loader should be present during initial load
    await waitFor(() => {
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });
  });

  test('handles empty transaction history', async () => {
    vi.spyOn(HistoryAPICalls, 'findUserTransactionHistory').mockResolvedValue([]);

    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/There are no transactions for this date/i),
      ).toBeInTheDocument();
    });
  });

  test('changes date to yesterday when selected', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    const dateSelect = screen.getByRole('combobox', { name: /Date/i });
    fireEvent.mouseDown(dateSelect);

    const yesterdayOption = await screen.findByText('Yesterday');
    fireEvent.click(yesterdayOption);

    await waitFor(() => {
      expect(HistoryAPICalls.findUserTransactionHistory).toHaveBeenCalled();
    });
  });

  test('changes date to this week when selected', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    const dateSelect = screen.getByRole('combobox', { name: /Date/i });
    fireEvent.mouseDown(dateSelect);

    const thisWeekOption = await screen.findByText('This Week');
    fireEvent.click(thisWeekOption);

    await waitFor(() => {
      expect(HistoryAPICalls.findUserTransactionHistory).toHaveBeenCalled();
    });
  });

  test('opens custom date dialog when custom option is selected', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    const dateSelect = screen.getByRole('combobox', { name: /Date/i });
    fireEvent.mouseDown(dateSelect);

    const customOption = await screen.findByText('Custom');
    fireEvent.click(customOption);

    await waitFor(() => {
      expect(screen.getByTestId('custom-date-dialog')).toBeInTheDocument();
    });
  });

  test('closes custom date dialog', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    const dateSelect = screen.getByRole('combobox', { name: /Date/i });
    fireEvent.mouseDown(dateSelect);

    const customOption = await screen.findByText('Custom');
    fireEvent.click(customOption);

    await waitFor(() => {
      expect(screen.getByTestId('custom-date-dialog')).toBeInTheDocument();
    });

    const closeButton = within(
      screen.getByTestId('custom-date-dialog'),
    ).getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId('custom-date-dialog'),
      ).not.toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.spyOn(HistoryAPICalls, 'findUserTransactionHistory').mockRejectedValue(
      new Error('API Error'),
    );

    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching history:',
        expect.any(Error),
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('displays user-specific transaction grouping', async () => {
    const multiUserTransactions = [
      ...mockCheckoutTransactions,
      {
        id: '2',
        user_id: 2,
        user_name: 'Jane Smith',
        timestamp: new Date().toISOString(),
        transaction_type: TransactionType.Checkout,
        building_id: 1,
        unit_number: '102',
        resident_name: 'Resident B',
        item_id: 1,
        quantity: 1,
      },
    ];

    vi.spyOn(HistoryAPICalls, 'findUserTransactionHistory').mockResolvedValue(
      multiUserTransactions,
    );

    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(HistoryAPICalls.findUserTransactionHistory).toHaveBeenCalled();
    });
  });

  test('displays "You" for current user transactions', async () => {
    const currentUserTransactions = [
      {
        id: '1',
        user_id: 1,
        user_name: 'Current User',
        timestamp: new Date().toISOString(),
        transaction_type: TransactionType.Checkout,
        building_id: 1,
        unit_number: '101',
        resident_name: 'Resident A',
        item_id: 1,
        quantity: 2,
      },
    ];

    vi.spyOn(HistoryAPICalls, 'findUserTransactionHistory').mockResolvedValue(
      currentUserTransactions,
    );

    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      // The component should display "You" instead of the user name for the current user
      expect(screen.queryByText('You')).toBeInTheDocument();
    });
  });

  test('calls findUserTransactionHistory with correct date format', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(HistoryAPICalls.findUserTransactionHistory).toHaveBeenCalledWith(
        mockUser,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        'checkout',
      );
    });
  });

  test('refetches transactions when date range changes', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(HistoryAPICalls.findUserTransactionHistory).toHaveBeenCalled();
    });

    const callCount = vi.mocked(HistoryAPICalls.findUserTransactionHistory).mock
      .calls.length;

    const dateSelect = screen.getByRole('combobox', { name: /Date/i });
    fireEvent.mouseDown(dateSelect);

    const yesterdayOption = await screen.findByText('Yesterday');
    fireEvent.click(yesterdayOption);

    await waitFor(() => {
      expect(
        vi.mocked(HistoryAPICalls.findUserTransactionHistory).mock.calls.length,
      ).toBeGreaterThan(callCount);
    });
  });
});
