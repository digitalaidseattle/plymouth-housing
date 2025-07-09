import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import VolunteerHome from './index';
import { UserContext } from '../../components/contexts/UserContext';

// Mock useXxxx and return a mock function
const mockHooks = vi.fn();
  vi.mock('react-router-dom', () => ({
  useNavigate: () => mockHooks,
  useLocation: () => mockHooks,
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
    setActiveVolunteers: vi.fn()
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

    // Verify header content; note that the date part cannot be compared precisely, so only keywords are checked
    expect(screen.getByText(/Thanks for being here!/i)).toBeInTheDocument();

    // Verify that the Check Out and Add Item buttons exist
    expect(screen.getByRole('button', { name: /Check Out/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
  });

  test('navigates to checkout when Check Out button is clicked', async () => {
    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    const checkOutButton = screen.getByRole('button', { name: /Check Out/i });
    fireEvent.click(checkOutButton);

    expect(mockHooks).toHaveBeenCalledWith('/checkout');
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

    // Initially, the modal should be closed
    const modal = screen.getByTestId('add-item-modal');
    expect(modal).toHaveTextContent('Modal Closed');

    // After clicking the Add Item button, the modal should open
    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    await waitFor(() => {
      expect(screen.getByTestId('add-item-modal')).toHaveTextContent('Modal Open');
    });

    // Simulate clicking the close button inside the modal to close it
    const closeModalButton = screen.getByText('Close Modal');
    fireEvent.click(closeModalButton);

    await waitFor(() => {
      expect(screen.getByTestId('add-item-modal')).toHaveTextContent('Modal Closed');
    });
  });

  test('handles fetch error gracefully and logs error', async () => {
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock fetch to return a non-ok status
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    // After clicking the Add Item button, the fetch call should happen
    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Check that console.error was called (the component logs error via console.error)
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

    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Check if the state is updated with fetched data
    expect(screen.getByTestId('add-item-modal')).toHaveTextContent('2 items');
  });
});
