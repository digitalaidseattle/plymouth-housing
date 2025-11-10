import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import UserPage from './index';

describe('UserPage Component', () => {
  test('renders without crashing', () => {
    render(<UserPage />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  test('opens and closes add volunteer modal', async () => {
    render(<UserPage />);
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByText('Add Volunteer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText('Add Volunteer')).not.toBeInTheDocument();
    });
  });

  test('displays error in Snackbar', async () => {
    vi.resetModules();
    vi.doMock('./useUsers', () => {
      return {
        default: () => ({
          error: 'Failed to fetch data',
          clearError: vi.fn(),
          originalData: [],
          filteredData: [],
          setFilteredData: vi.fn(),
          refetch: vi.fn(),
          updateUserStatus: vi.fn(),
        }),
      };
    });
    const { default: UserPageWithError } = await import('./index');
    render(<UserPageWithError />);
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Failed to fetch data');
    });
  });
});

describe('UserPage Component Functions', () => {
  test('handleNameOrderToggle cycles through sorting orders', async () => {
    render(<UserPage />);
    const nameOrderButton = screen.getByText('Name');

    // First click should set to 'asc'
    fireEvent.click(nameOrderButton);
    await waitFor(() => {
      expect(screen.getByTestId('ArrowUpwardIcon')).toBeInTheDocument();
    });

    // Second click should set to 'desc'
    fireEvent.click(nameOrderButton);
    await waitFor(() => {
      expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument();
    });

    // Third click should reset to 'original' (no icon)
    fireEvent.click(nameOrderButton);
    await waitFor(() => {
      expect(screen.queryByTestId('ArrowUpwardIcon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ArrowDownwardIcon')).not.toBeInTheDocument();
    });
  });

  test('handleSnackbarClose dismisses the Snackbar alert', async () => {
    // Mock useUsers with an error BEFORE rendering
    const mockClearError = vi.fn();
    vi.resetModules();
    vi.doMock('./useUsers', () => ({
      default: () => ({
        error: 'Error fetching users:',
        clearError: mockClearError,
        originalData: [],
        filteredData: [],
        setFilteredData: vi.fn(),
        refetch: vi.fn(),
        updateUserStatus: vi.fn(),
      }),
    }));

    const { default: UserPageWithError } = await import('./index');
    render(<UserPageWithError />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Error fetching users:/i);
    });

    // MUI Alert close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
    });
  });
});

describe('UserPage Additional Functional Tests', () => {
  const customUsers = [
    {
      id: 1,
      name: 'Charlie',
      role: 'admin',
      active: true,
      created_at: new Date().toISOString(),
      last_signed_in: new Date().toISOString(),
      PIN: null,
    },
    {
      id: 2,
      name: 'Alice',
      role: 'volunteer',
      active: false,
      created_at: new Date().toISOString(),
      last_signed_in: new Date().toISOString(),
      PIN: '1111',
    },
    {
      id: 3,
      name: 'Bob',
      role: 'volunteer',
      active: true,
      created_at: new Date().toISOString(),
      last_signed_in: new Date().toISOString(),
      PIN: '2222',
    },
  ];

  test('filters users by role', async () => {
    const mockSetFilteredData = vi.fn();
    vi.resetModules();
    vi.doMock('./useUsers', () => ({
      default: () => ({
        originalData: customUsers,
        filteredData: customUsers,
        setFilteredData: mockSetFilteredData,
        error: null,
        clearError: vi.fn(),
        refetch: vi.fn(),
        updateUserStatus: vi.fn(),
      }),
    }));
    const { default: UserPageCustom } = await import('./index');
    render(<UserPageCustom />);

    // open role filter menu
    fireEvent.click(screen.getByLabelText('Role Filter'));
    await waitFor(() => {
      expect(screen.getByText('Volunteer')).toBeInTheDocument();
    });
    // select Volunteer role
    fireEvent.click(screen.getByText('Volunteer'));

    await waitFor(() => {
      const lastCall =
        mockSetFilteredData.mock.calls[mockSetFilteredData.mock.calls.length - 1][0];
      const names = lastCall.map((u: any) => u.name);
      // should only show volunteer users
      expect(names).toEqual(['Alice', 'Bob']);
    });
  });

  test('sorts users by name in ascending and descending order', async () => {
    const mockSetFilteredData = vi.fn();
    vi.resetModules();
    vi.doMock('./useUsers', () => ({
      default: () => ({
        originalData: customUsers,
        filteredData: customUsers,
        setFilteredData: mockSetFilteredData,
        error: null,
        clearError: vi.fn(),
        refetch: vi.fn(),
        updateUserStatus: vi.fn(),
      }),
    }));
    const { default: UserPageCustom } = await import('./index');
    render(<UserPageCustom />);

    const nameHeader = screen.getByText('Name');
    // first click: sort by name in ascending order
    fireEvent.click(nameHeader);
    await waitFor(() => {
      expect(mockSetFilteredData).toHaveBeenCalled();
    });
    let lastCall = mockSetFilteredData.mock.calls[mockSetFilteredData.mock.calls.length - 1][0];
    let names = lastCall.map((u: any) => u.name);
    expect(names).toEqual(['Alice', 'Bob', 'Charlie']);

    // second click: sort by name in descending order
    fireEvent.click(nameHeader);
    await waitFor(() => {
      expect(mockSetFilteredData).toHaveBeenCalled();
    });
    lastCall = mockSetFilteredData.mock.calls[mockSetFilteredData.mock.calls.length - 1][0];
    names = lastCall.map((u: any) => u.name);
    expect(names).toEqual(['Charlie', 'Bob', 'Alice']);

    // third click: reset to original order
    fireEvent.click(nameHeader);
    await waitFor(() => {
      expect(mockSetFilteredData).toHaveBeenCalled();
    });
    lastCall = mockSetFilteredData.mock.calls[mockSetFilteredData.mock.calls.length - 1][0];
    names = lastCall.map((u: any) => u.name);
    expect(names).toEqual(['Charlie', 'Alice', 'Bob']);
  });

  test('changes page when pagination is used', async () => {
    const elevenUsers = Array.from({ length: 11 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      role: i % 2 === 0 ? 'admin' : 'volunteer',
      active: i % 2 === 0,
      created_at: new Date().toISOString(),
      last_signed_in: new Date().toISOString(),
      PIN: i % 2 === 0 ? null : '1234',
    }));
    vi.resetModules();
    vi.doMock('./useUsers', () => ({
      default: () => ({
        originalData: elevenUsers,
        filteredData: elevenUsers,
        setFilteredData: vi.fn(),
        error: null,
        clearError: vi.fn(),
        refetch: vi.fn(),
        updateUserStatus: vi.fn(),
      }),
    }));
    const { default: UserPageCustom } = await import('./index');
    render(<UserPageCustom />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /go to page 2/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /go to page 2/i }));
    await waitFor(() => {
      // page 2 should show users 11 and 1
      expect(screen.getByText('User 11')).toBeInTheDocument();
      expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    });
  });

  test('shows success snackbar on successful status update', async () => {
    vi.resetModules();
    vi.doMock('./useUsers', () => ({
      default: () => ({
        originalData: customUsers,
        filteredData: customUsers,
        setFilteredData: vi.fn(),
        error: null,
        clearError: vi.fn(),
        refetch: vi.fn(),
        updateUserStatus: vi.fn().mockResolvedValue(undefined),
      }),
    }));
    const { default: UserPageCustom } = await import('./index');
    render(<UserPageCustom />);
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/Deactivate Role|Activate Role/)).toBeInTheDocument();
    });
    const statusToggleItem = screen.getByText(/Deactivate Role|Activate Role/);
    fireEvent.click(statusToggleItem);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('User status updated successfully!');
    });
  });

  test('shows error snackbar on failed status update', async () => {
    vi.resetModules();
    vi.doMock('./useUsers', () => ({
      default: () => ({
        originalData: customUsers,
        filteredData: customUsers,
        setFilteredData: vi.fn(),
        error: null,
        clearError: vi.fn(),
        refetch: vi.fn(),
        updateUserStatus: vi.fn().mockRejectedValue(new Error('Test error')),
      }),
    }));
    const { default: UserPageCustom } = await import('./index');
    render(<UserPageCustom />);
    const moreButtons = screen.getAllByLabelText('more');
    fireEvent.click(moreButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/Deactivate Role|Activate Role/)).toBeInTheDocument();
    });
    const statusToggleItem = screen.getByText(/Deactivate Role|Activate Role/);
    fireEvent.click(statusToggleItem);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error updating user: Error: Test error');
    });
  });
});
