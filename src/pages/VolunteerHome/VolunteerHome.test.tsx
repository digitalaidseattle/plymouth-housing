/**
 *  VolunteerHome.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import VolunteerHome from './index';
import { UserContext } from '../../components/contexts/UserContext';

const mockNavigate = vi.fn();
const mockLocation = {
  pathname: '/volunteer-home',
  search: '',
  hash: '',
  state: { checkoutSuccess: true, message: '1 item has been checked out' },
  key: 'default',
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock SnackbarAlert
vi.mock('../../components/SnackbarAlert.tsx', () => ({
  default: ({ children }: any) => (
    <div data-testid="snackbar-alert">{children}</div>
  ),
}));

// Provide a user object that meets the requirements of UserContext
// (Note: according to the type, userRoles and claims must be provided)
const mockUser = {
  userId: '1',
  userDetails: 'Test User',
  userRoles: ['admin'],
  claims: [],
};

// Wrapper component to wrap VolunteerHome with the required Context provider
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
      pinVerified: false,
      setPinVerified: vi.fn(),
    }}
  >
    {children}
  </UserContext.Provider>
);

describe('VolunteerHome Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders the header and exactly two action buttons', () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>,
    );

    expect(screen.getByText(/Thanks for being here!/i)).toBeInTheDocument();

    const today = 'Monday, June 15';
    expect(screen.getByText(today)).toBeInTheDocument();
    expect(screen.getByText('General Inventory')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    const checkoutSection = screen.getByTestId('section-checkout');
    const inventorySection = screen.getByTestId('section-inventory');

    // Unanchored: each card's accessible name now also carries its subtitle.
    expect(
      within(checkoutSection).getByRole('button', {
        name: /^Check out/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(inventorySection).getByRole('button', { name: /^Add stock/i }),
    ).toBeInTheDocument();

    expect(screen.getByText('Add items to inventory')).toBeInTheDocument();
  });

  test('does not offer a Welcome Basket action', () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>,
    );

    expect(screen.queryByText(/Welcome Basket/i)).not.toBeInTheDocument();
  });

  test('navigates to general checkout when Check out is clicked', () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>,
    );

    const checkoutSection = screen.getByTestId('section-checkout');
    fireEvent.click(
      within(checkoutSection).getByRole('button', {
        name: /^Check out/i,
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/checkout', {
      state: { checkoutType: 'general' },
    });
  });

  test('navigates to inventory with the add modal open when Add stock is clicked', () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>,
    );

    const inventorySection = screen.getByTestId('section-inventory');
    fireEvent.click(
      within(inventorySection).getByRole('button', { name: /^Add stock/i }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/inventory', {
      state: { inventoryType: 'General', openAddModal: true },
    });
  });

  test('render snackbar', () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>,
    );

    expect(screen.queryByTestId('snackbar-alert')).toBeInTheDocument();
    // snackbar should take message from the location object
    expect(screen.queryByTestId('snackbar-alert')).toHaveTextContent(
      mockLocation.state.message,
    );
  });
});
