import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import VolunteerHome from './index';
import { UserContext } from '../../components/contexts/UserContext';

const mockNavigate = vi.fn();
const mockLocation = {
  pathname: '/volunteer-home',
  search: '',
  hash: '',
  state: { checkoutSuccess: true, message: "1 item has been checked out" },
  key: 'default'
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

// Mock AddItemModal so we can control its display state using a test id
vi.mock('../../components/inventory/AddItemModal.tsx', () => ({
  default: ({ addModal, handleAddClose, originalData }: any) => (
    <div data-testid="add-item-modal">
      {addModal ? "Modal Open" : "Modal Closed"} - {originalData.length} items
      <button onClick={handleAddClose}>Close Modal</button>
    </div>
  ),
}));

// Mock SnackbarAlert
vi.mock('../../components/SnackbarAlert.tsx', () => ({
  default: ({ children }: any) => (
    <div data-testid="snackbar-alert">
      {children}
    </div>
  ),
}));

// Provide a user object that meets the requirements of UserContext 
// (Note: according to the type, userRoles and claims must be provided)
const mockUser = {
  userID: "1",
  userDetails: "Test User",
  userRoles: ["admin"],
  claims: []
};

// Wrapper component to wrap VolunteerHome with the required Context provider
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UserContext.Provider value={{ 
    user: mockUser, 
    setUser: vi.fn(),
    loggedInUserId: 1,
    setLoggedInUserId: vi.fn(),
    activeVolunteers: [],
    setActiveVolunteers: vi.fn(),
    isLoading: false
  }}>
    {children}
  </UserContext.Provider>
);

describe('VolunteerHome Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('renders header and buttons correctly on successful fetch', async () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    expect(screen.getByText(/Thanks for being here!/i)).toBeInTheDocument();

    const checkoutSection = screen.getByTestId('section-checkout');
    const stockSection = screen.getByTestId('section-stock');

    expect(within(checkoutSection).getByRole('button', { name: /General Inventory/i })).toBeInTheDocument();
    expect(within(checkoutSection).getByRole('button', { name: /Welcome Basket/i })).toBeInTheDocument();
    expect(within(stockSection).getByRole('button', { name: /General Inventory/i })).toBeInTheDocument();
    expect(within(stockSection).getByRole('button', { name: /Welcome Basket/i })).toBeInTheDocument();
  });

  test('navigates to checkout when Check Out button is clicked', async () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    const checkoutSection = screen.getByTestId('section-checkout');
    fireEvent.click(within(checkoutSection).getByRole('button', { name: /General Inventory/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/checkout', { state: { checkoutType: 'general' } });
  });

  test('navigates to checkout with welcomeBasket type when Welcome Basket Check Out button is clicked', async () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    const checkoutSection = screen.getByTestId('section-checkout');
    fireEvent.click(within(checkoutSection).getByRole('button', { name: /Welcome Basket/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/checkout', { state: { checkoutType: 'welcomeBasket' } });
  });

  test('opens and closes AddItemModal when Add Item button is clicked', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: [] }),
    });

    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    const modal = screen.getByTestId('add-item-modal');
    expect(modal).toHaveTextContent('Modal Closed');

    const stockSection = screen.getByTestId('section-stock');
    fireEvent.click(within(stockSection).getByRole('button', { name: /General Inventory/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    await waitFor(() => {
      expect(screen.getByTestId('add-item-modal')).toHaveTextContent('Modal Open');
    });

    const closeModalButton = screen.getByText('Close Modal');
    fireEvent.click(closeModalButton);

    await waitFor(() => {
      expect(screen.getByTestId('add-item-modal')).toHaveTextContent('Modal Closed');
    });
  });

  test('handles fetch error gracefully and logs error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    const stockSection = screen.getByTestId('section-stock');
    fireEvent.click(within(stockSection).getByRole('button', { name: /General Inventory/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('fetches data successfully and updates state', async () => {
    const mockData = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: mockData }),
    });

    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    const stockSection = screen.getByTestId('section-stock');
    fireEvent.click(within(stockSection).getByRole('button', { name: /General Inventory/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    expect(screen.getByTestId('add-item-modal')).toHaveTextContent('2 items');
  });

  test('render snackbar', async () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    expect(screen.queryByTestId('snackbar-alert')).toBeInTheDocument();  
    // snackbar should take message from the location object
    expect(screen.queryByTestId('snackbar-alert')).toHaveTextContent(mockLocation.state.message);  
  })

});
