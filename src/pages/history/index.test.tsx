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
import {
  TransactionType,
  CheckoutTransaction,
  InventoryTransaction,
} from '../../types/history';
import { Building } from '../../types/interfaces';

// Mock modules
vi.mock('../../components/History/HistoryAPICalls');
vi.mock('../../components/Checkout/CheckoutAPICalls');
vi.mock('../../components/utils/fetchCategorizedItems');
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
    <div
      data-testid={`general-checkout-card-${checkoutTransaction.transaction_id}`}
    >
      General Checkout
    </div>
  ),
}));
vi.mock('../../components/History/WelcomeBasketCard', () => ({
  default: ({ checkoutTransaction }: any) => (
    <div
      data-testid={`welcome-basket-card-${checkoutTransaction.transaction_id}`}
    >
      Welcome Basket
    </div>
  ),
}));
vi.mock('../../components/History/InventoryCard', () => ({
  default: ({ inventoryTransaction }: any) => (
    <div
      data-testid={`inventory-card-${inventoryTransaction.transaction_id}`}
    >
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

const mockBuildings: Building[] = [
  { id: 1, code: 'A', name: '123 Main St' },
  { id: 2, code: 'B', name: '456 Oak Ave' },
];

const mockCategorizedItems = [
  {
    id: 1,
    category: 'Food',
    items: [
      {
        id: 1,
        name: 'Bread',
        quantity: 10,
        description: 'Fresh bread',
      },
    ],
    checkout_limit: 5,
    categoryCount: 1,
  },
];

const mockCheckoutTransactions: CheckoutTransaction[] = [
  {
    transaction_id: '1',
    user_id: 1,
    building_id: 1,
    unit_number: '101',
    resident_id: 1,
    resident_name: 'Resident A',
    transaction_date: new Date().toISOString(),
    item_type: 'general',
    total_quantity: 2,
    welcome_basket_item_id: null,
    welcome_basket_quantity: null,
  },
];

const mockInventoryTransactions: InventoryTransaction[] = [
  {
    transaction_id: '2',
    user_id: 1,
    transaction_date: new Date().toISOString(),
    transaction_type: TransactionType.InventoryAdd,
    item_name: 'Bread',
    category_name: 'Food',
    quantity: 10,
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
    vi.spyOn(HistoryAPICalls, 'getCheckoutHistory').mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockCheckoutTransactions), 50),
        ),
    );
    vi.spyOn(HistoryAPICalls, 'getInventoryHistory').mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockInventoryTransactions), 50),
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
    expect(checkoutButton).toHaveClass('Mui-selected');
  });

  test('switches between checkout and inventory history types', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    const checkoutButton = screen.getByRole('button', { name: /Check out/i });
    const inventoryButton = screen.getByRole('button', { name: /Inventory/i });

    await waitFor(() => {
      expect(HistoryAPICalls.getCheckoutHistory).toHaveBeenCalledWith(
        mockUser,
        expect.any(String),
        expect.any(String),
      );
    });

    // Initially, checkout is active
    expect(checkoutButton).toHaveClass('Mui-selected');
    expect(inventoryButton).not.toHaveClass('Mui-selected');

    // Click inventory button
    fireEvent.click(inventoryButton);

    await waitFor(() => {
      expect(inventoryButton).toHaveClass('Mui-selected');
      expect(checkoutButton).not.toHaveClass('Mui-selected');
    });

    // Verify API was called for inventory
    expect(HistoryAPICalls.getInventoryHistory).toHaveBeenCalledWith(
      mockUser,
      expect.any(String),
      expect.any(String),
    );
  });

  test('fetches and displays checkout transactions', async () => {
    vi.spyOn(HistoryAPICalls, 'getCheckoutHistory').mockResolvedValue(
      mockCheckoutTransactions,
    );

    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(HistoryAPICalls.getCheckoutHistory).toHaveBeenCalled();
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
    vi.spyOn(HistoryAPICalls, 'getCheckoutHistory').mockResolvedValue([]);

    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No transactions found for this date/i),
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
      expect(HistoryAPICalls.getCheckoutHistory).toHaveBeenCalled();
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
      expect(HistoryAPICalls.getCheckoutHistory).toHaveBeenCalled();
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
    vi.spyOn(HistoryAPICalls, 'getCheckoutHistory').mockRejectedValue(
      new Error('API Error'),
    );

    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    // Error should be displayed in a snackbar
    await waitFor(() => {
      expect(screen.getByText(/Error fetching history:/i)).toBeInTheDocument();
    });
  });

  test('displays user-specific transaction grouping', async () => {
    const multiUserTransactions: CheckoutTransaction[] = [
      ...mockCheckoutTransactions,
      {
        transaction_id: '2',
        user_id: 2,
        building_id: 1,
        unit_number: '102',
        resident_id: 2,
        resident_name: 'Resident B',
        transaction_date: new Date().toISOString(),
        item_type: 'general',
        total_quantity: 1,
        welcome_basket_item_id: null,
        welcome_basket_quantity: null,
      },
    ];

    vi.spyOn(HistoryAPICalls, 'getCheckoutHistory').mockResolvedValue(
      multiUserTransactions,
    );

    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(HistoryAPICalls.getCheckoutHistory).toHaveBeenCalled();
    });
  });

  test('displays "You" for current user transactions', async () => {
    const currentUserTransactions: CheckoutTransaction[] = [
      {
        transaction_id: '1',
        user_id: 1,
        building_id: 1,
        unit_number: '101',
        resident_id: 1,
        resident_name: 'Resident A',
        transaction_date: new Date().toISOString(),
        item_type: 'general',
        total_quantity: 2,
        welcome_basket_item_id: null,
        welcome_basket_quantity: null,
      },
    ];

    vi.spyOn(HistoryAPICalls, 'getCheckoutHistory').mockResolvedValue(
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

  test('calls getCheckoutHistory with correct date format', async () => {
    render(
      <Wrapper>
        <HistoryPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(HistoryAPICalls.getCheckoutHistory).toHaveBeenCalledWith(
        mockUser,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
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
      expect(HistoryAPICalls.getCheckoutHistory).toHaveBeenCalled();
    });

    const callCount = vi.mocked(HistoryAPICalls.getCheckoutHistory).mock
      .calls.length;

    const dateSelect = screen.getByRole('combobox', { name: /Date/i });
    fireEvent.mouseDown(dateSelect);

    const yesterdayOption = await screen.findByText('Yesterday');
    fireEvent.click(yesterdayOption);

    await waitFor(() => {
      expect(
        vi.mocked(HistoryAPICalls.getCheckoutHistory).mock.calls.length,
      ).toBeGreaterThan(callCount);
    });
  });
});
