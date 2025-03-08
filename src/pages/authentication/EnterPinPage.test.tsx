import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import EnterPinPage from './EnterPinPage';
import { UserContext } from '../../components/contexts/UserContext';

// Mock useNavigate and return a mock function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock PinInput to simulate PIN entry.
// It renders an input element; on change, it calls onPinChange with the input value split into an array.
vi.mock('./PinInput', () => ({
  default: ({ onPinChange }: { onPinChange: (pin: string[]) => void }) => (
    <input
      data-testid="pin-input"
      onChange={(e) => onPinChange(e.target.value.split(''))}
    />
  ),
}));

// Define a helper function to create the required UserContext value
const createUserContextValue = (overrides = {}) => ({
  user: { userID: "1", userDetails: "Test", userRoles: ["volunteer"], claims: [] },
  setUser: vi.fn(),
  loggedInUserId: 123,
  setLoggedInUserId: vi.fn(),
  activeVolunteers: [],
  setActiveVolunteers: vi.fn(),
  ...overrides,
});

describe('EnterPinPage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockNavigate.mockReset();
  });

  test('redirects to /pick-your-name if loggedInUserId is null', () => {
    render(
      <UserContext.Provider value={createUserContextValue({ loggedInUserId: null })}>
        <EnterPinPage />
      </UserContext.Provider>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/pick-your-name');
  });

  test('shows snackbar warning when PIN is incomplete', async () => {
    render(
      <UserContext.Provider value={createUserContextValue()}>
        <EnterPinPage />
      </UserContext.Provider>
    );

    // With default PIN state (["", "", "", ""]), click Continue.
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);

    // Expect a warning snackbar message about incomplete PIN
    await waitFor(() => {
      expect(screen.getByText(/Please enter your PIN before continuing./i)).toBeInTheDocument();
    });
  });

  test('handles valid PIN and navigates to volunteer-home', async () => {
    // Set up fetch mocks:
    // 1st call: verifying the PIN (returns valid)
    // 2nd call: updating last signed-in (succeeds)
    (global.fetch as any) = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: [{ IsValid: true }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(
      <UserContext.Provider value={createUserContextValue()}>
        <EnterPinPage />
      </UserContext.Provider>
    );

    // Simulate entering a complete PIN via the mocked PinInput.
    const pinInput = screen.getByTestId('pin-input');
    fireEvent.change(pinInput, { target: { value: '1234' } });

    // Click the Continue button.
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);

    // Wait for the success snackbar message to appear.
    await waitFor(() => {
      expect(screen.getByText(/Login successful! Redirecting.../i)).toBeInTheDocument();
    });

    // Expect navigation to volunteer-home.
    expect(mockNavigate).toHaveBeenCalledWith('/volunteer-home');
    // Verify that both fetch calls were made.
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('handles invalid PIN and shows error snackbar', async () => {
    // Set up fetch mock for verifyPin returning an invalid result with an error message.
    (global.fetch as any) = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ value: [{ IsValid: false, ErrorMessage: "Incorrect PIN." }] }),
    });
  
    render(
      <UserContext.Provider value={createUserContextValue()}>
        <EnterPinPage />
      </UserContext.Provider>
    );
  
    // Simulate entering a complete PIN.
    const pinInput = screen.getByTestId('pin-input');
    fireEvent.change(pinInput, { target: { value: '1234' } });
  
    // Click the Continue button.
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);
  
    // Wait for the error snackbar message to appear using a custom matcher.
    await waitFor(() => {
      expect(
        screen.getByText((content, _ ) =>
          content.replace(/\s+/g, ' ').includes('Incorrect PIN.')
        )
      ).toBeInTheDocument();
    });
  
    // Ensure that navigation to volunteer-home was not triggered.
    expect(mockNavigate).not.toHaveBeenCalledWith('/volunteer-home');
  });
  

  test('navigates back to /pick-your-name when back link is clicked', async () => {
    render(
      <UserContext.Provider value={createUserContextValue()}>
        <EnterPinPage />
      </UserContext.Provider>
    );

    // Click the back link text.
    const backLink = screen.getByText(/Back to the name selection./i);
    fireEvent.click(backLink);
    expect(mockNavigate).toHaveBeenCalledWith('/pick-your-name');
  });
});
