import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import VolunteerHome from './index';
import { UserContext } from '../../components/contexts/UserContext';

// Mock useNavigate and return a mock function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
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
    // Mock fetch to return inventory data (even though the component does not directly display the inventory data,
    // it passes the data to AddItemModal)
    const fakeData = { value: [{ id: 1 }, { id: 2 }] };
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeData,
    });

    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    // Wait for fetch to complete (the component calls fetchData and sets isLoading to false)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    // Verify header content; note that the date part cannot be compared precisely, so only keywords are checked
    expect(screen.getByText(/Thanks for being here!/i)).toBeInTheDocument();

    // Verify that the Check Out and Add Item buttons exist
    expect(screen.getByRole('button', { name: /Check Out/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();

    // Verify that AddItemModal is initially closed and that the inventory data count is correct (2 items in this case)
    expect(screen.getByTestId('add-item-modal')).toHaveTextContent('Modal Closed - 2 items');
  });

  test('navigates to checkout when Check Out button is clicked', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ value: [] }),
    });

    render(
      <Wrapper>
        <VolunteerHome />
      </Wrapper>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const checkOutButton = screen.getByRole('button', { name: /Check Out/i });
    fireEvent.click(checkOutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
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

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Initially, the modal should be closed
    const modal = screen.getByTestId('add-item-modal');
    expect(modal).toHaveTextContent('Modal Closed');

    // After clicking the Add Item button, the modal should open
    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);

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

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // Check that console.error was called (the component logs error via console.error)
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
