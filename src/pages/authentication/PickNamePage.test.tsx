import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PickNamePage from './PickNamePage';
import { UserContext } from '../../components/contexts/UserContext';

const mockNavigate = vi.fn();
const mockFetchWithRetry = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('../../components/fetchWithRetry', () => ({
  fetchWithRetry: () => mockFetchWithRetry()
}));

vi.mock('./SpinUpDialog', () => ({
  default: ({ open, retryCount }: { open: boolean; retryCount: number }) => (
    <div data-testid="spin-up-dialog">
      {open ? "Dialog Open" : "Dialog Closed"} - Retry: {retryCount}
    </div>
  )
}));

const createUserContextValue = (overrides = {}) => ({
  user: { userID: "1", userDetails: "Test User", userRoles: ["volunteer"], claims: [] },
  loggedInUserId: null,
  setLoggedInUserId: vi.fn(),
  activeVolunteers: [],
  setActiveVolunteers: vi.fn(),
  setUser: vi.fn(),
  ...overrides,
});

describe('PickNamePage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockNavigate.mockReset();
    mockFetchWithRetry.mockReset();
  });

  test('fetches volunteers on mount and updates Autocomplete label', async () => {
    const volunteers = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    mockFetchWithRetry.mockResolvedValue({ value: volunteers });

    render(
      <UserContext.Provider value={createUserContextValue()}>
        <PickNamePage />
      </UserContext.Provider>
    );

    expect(screen.getByLabelText(/Loading\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText(/Select your name/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Pick Your Name/i)).toBeInTheDocument();
    expect(screen.getByText(/contact IT department/i)).toBeInTheDocument();
  });

  test('navigates to /enter-your-pin when a name is selected and Continue is clicked', async () => {
    const volunteers = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

    mockFetchWithRetry.mockResolvedValue({ value: volunteers });

    render(
      <UserContext.Provider
        value={createUserContextValue({
          activeVolunteers: volunteers,
          loggedInUserId: 1,
        })}
      >
        <PickNamePage />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Select your name/i)).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/enter-your-pin');
    });
  });

  test('shows snackbar warning if no name is selected when clicking Continue', async () => {
    const volunteers = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

    mockFetchWithRetry.mockResolvedValue({ value: volunteers });

    // Provide context with volunteers but with no selected volunteer (loggedInUserId: null)
    render(
      <UserContext.Provider
        value={createUserContextValue({
          activeVolunteers: volunteers,
          loggedInUserId: null,
        })}
      >
        <PickNamePage />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Select your name/i)).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);

    // Wait for the snackbar message; use a flexible matcher in case the text is split.
    await waitFor(() => {
      const snackbar = screen.getByText((content) =>
        content.replace(/\s+/g, ' ').includes('Please select a name before continuing.')
      );
      expect(snackbar).toBeInTheDocument();
    });
  });

  test('disables Autocomplete and Continue button while loading', async () => {
    // Create a pending promise to simulate a loading state.
    let resolvePromise: any;
    const pendingPromise = new Promise((resolve) => { resolvePromise = resolve; });
    mockFetchWithRetry.mockReturnValue(pendingPromise);

    render(
      <UserContext.Provider value={createUserContextValue()}>
        <PickNamePage />
      </UserContext.Provider>
    );

    // While loading, the TextField label should be "Loading..."
    expect(screen.getByLabelText(/Loading\.\.\./i)).toBeInTheDocument();
    // The Continue button should be disabled.
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).toBeDisabled();

    // Resolve the pending promise with empty volunteer data.
    resolvePromise({ value: [] });
    await waitFor(() => {
      expect(screen.getByLabelText(/Select your name/i)).toBeInTheDocument();
    });
  });

  test('renders SpinUpDialog with correct props', async () => {
    // Simulate a pending fetch to trigger SpinUpDialog.
    let resolvePromise: any;
    const pendingPromise = new Promise((resolve) => { resolvePromise = resolve; });
    mockFetchWithRetry.mockReturnValue(pendingPromise);

    render(
      <UserContext.Provider value={createUserContextValue()}>
        <PickNamePage />
      </UserContext.Provider>
    );

    // SpinUpDialog should be rendered.
    const spinUpDialog = screen.getByTestId('spin-up-dialog');
    expect(spinUpDialog).toBeInTheDocument();

    // Now, resolve the fetch promise.
    resolvePromise({ value: [] });
    await waitFor(() => {
      // After resolution, SpinUpDialog should display as "Dialog Closed"
      expect(screen.getByTestId('spin-up-dialog')).toHaveTextContent(/Dialog Closed/);
    });
  });
});

