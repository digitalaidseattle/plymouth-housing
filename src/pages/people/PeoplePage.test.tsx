import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import UserPage from './index';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import { User } from '../../types/interfaces';

vi.mock('../useUsers', () => {
  return {
    default: () => ({
      originalData: [
        {
          id: 1,
          name: 'John Doe',
          role: 'admin',
          active: true,
          created_at: new Date().toISOString(),
          last_signed_in: new Date().toISOString(),
          PIN: null,
        },
        {
          id: 2,
          name: 'Jane Smith',
          role: 'volunteer',
          active: false,
          created_at: new Date().toISOString(),
          last_signed_in: new Date().toISOString(),
          PIN: '5678',
        },
      ],
      filteredData: [
        {
          id: 1,
          name: 'John Doe',
          role: 'admin',
          active: true,
          created_at: new Date().toISOString(),
          last_signed_in: new Date().toISOString(),
          PIN: null,
        },
        {
          id: 2,
          name: 'Jane Smith',
          role: 'volunteer',
          active: false,
          created_at: new Date().toISOString(),
          last_signed_in: new Date().toISOString(),
          PIN: '5678',
        },
      ],
      setFilteredData: vi.fn(),
      error: null,
      refetch: vi.fn(),
      updateUserStatus: vi.fn(),
    }),
  };
});

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
    vi.doMock('../useUsers', () => {
      return {
        default: () => ({
          error: 'Failed to fetch data',
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
      expect(alert).toHaveTextContent(/Error fetching users:/i);
    });
  });
});

describe('UserFilters Component', () => {
  test('updates search input', () => {
    const handleSearchChange = vi.fn();
    render(
      <UserFilters
        search=""
        onSearchChange={handleSearchChange}
        statusFilter={null}
        onStatusFilterChange={vi.fn()}
        roleFilter={null}
        onRoleFilterChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'John' },
    });
    expect(handleSearchChange).toHaveBeenCalledTimes(1);
  });
});

describe('UserTable Component', () => {
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      role: 'admin' as 'admin',
      active: true,
      created_at: new Date().toISOString(),
      last_signed_in: new Date().toISOString(),
      PIN: null,
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'volunteer' as 'volunteer',
      active: false,
      created_at: new Date().toISOString(),
      last_signed_in: new Date().toISOString(),
      PIN: '5678',
    },
  ];

  test('renders user list', () => {
    render(
      <UserTable
        users={mockUsers}
        nameOrder="original"
        onNameOrderToggle={vi.fn()}
        onStatusToggle={vi.fn()}
      />,
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('toggles user status', () => {
    const mockToggle = vi.fn();
    render(
      <UserTable
        users={mockUsers}
        nameOrder="original"
        onNameOrderToggle={vi.fn()}
        onStatusToggle={mockToggle}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[0]);
    fireEvent.click(screen.getByText('Deactivate Role'));
    expect(mockToggle).toHaveBeenCalledWith(1);
  });

  test('shows PIN modal', async () => {
    render(
      <UserTable
        users={mockUsers}
        nameOrder="original"
        onNameOrderToggle={vi.fn()}
        onStatusToggle={vi.fn()}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[1]);
    await waitFor(() =>
      expect(screen.getByText('Show PIN')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText('Show PIN'));
    await waitFor(() =>
      expect(screen.getByText('Pin code:')).toBeInTheDocument(),
    );
  });

  test('displays warning when PIN is unavailable', async () => {
    const mockUsersNoPin: User[] = [
      {
        id: 1,
        name: 'John Doe',
        role: 'admin' as 'admin',
        active: true,
        created_at: new Date().toISOString(),
        last_signed_in: new Date().toISOString(),
        PIN: null,
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'volunteer' as 'volunteer',
        active: false,
        created_at: new Date().toISOString(),
        last_signed_in: new Date().toISOString(),
        PIN: '', // without PIN
      },
    ];
    render(
      <UserTable
        users={mockUsersNoPin}
        nameOrder="original"
        onNameOrderToggle={vi.fn()}
        onStatusToggle={vi.fn()}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[1]);
    await waitFor(() =>
      expect(screen.getByText('Show PIN')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText('Show PIN'));
    await waitFor(() =>
      expect(screen.getByText(/pin not available/i)).toBeInTheDocument(),
    );
  });

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
      vi.doMock('../useUsers', () => {
        return {
          default: () => ({
            error: 'Error fetching users:',
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
        expect(alert).toHaveTextContent(/Error fetching users:/i);
      });
    });
  });

  describe('UserFilters Component', () => {
    test('updates search input', () => {
      const handleSearchChange = vi.fn();
      render(
        <UserFilters
          search=""
          onSearchChange={handleSearchChange}
          statusFilter={null}
          onStatusFilterChange={vi.fn()}
          roleFilter={null}
          onRoleFilterChange={vi.fn()}
        />,
      );
      fireEvent.change(screen.getByPlaceholderText('Search...'), {
        target: { value: 'John' },
      });
      expect(handleSearchChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('UserTable Component', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'John Doe',
        role: 'admin',
        active: true,
        created_at: new Date().toISOString(),
        last_signed_in: new Date().toISOString(),
        PIN: null,
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'volunteer',
        active: false,
        created_at: new Date().toISOString(),
        last_signed_in: new Date().toISOString(),
        PIN: '5678',
      },
    ];

    test('renders user list', () => {
      render(
        <UserTable
          users={mockUsers}
          nameOrder="original"
          onNameOrderToggle={vi.fn()}
          onStatusToggle={vi.fn()}
        />,
      );
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('toggles user status', () => {
      const mockToggle = vi.fn();
      render(
        <UserTable
          users={mockUsers}
          nameOrder="original"
          onNameOrderToggle={vi.fn()}
          onStatusToggle={mockToggle}
        />,
      );
      fireEvent.click(screen.getAllByRole('button', { name: /more/i })[0]);
      fireEvent.click(screen.getByText('Deactivate Role'));
      expect(mockToggle).toHaveBeenCalledWith(1);
    });
  });
});


// Tests for UserPage Component Functions
describe('UserPage Component Functionality Tests', () => {
    test('handleNameOrderToggle cycles through sorting orders', async () => {
      render(<UserPage />);
      const nameOrderButton = screen.getByText('Name');
  
      // Initial click should set to 'asc'
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
      render(<UserPage />);
      
      // Trigger a simulated error
      vi.mock('./useUsers', () => ({
        default: () => ({
          error: 'Error fetching users:',
          originalData: [],
          filteredData: [],
          setFilteredData: vi.fn(),
          refetch: vi.fn(),
          updateUserStatus: vi.fn(),
        }),
      }));
  
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Error fetching users:/i);
      });
  
      // Close the Snackbar
      fireEvent.click(screen.getByLabelText('Close'));
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    test('handleRoleClose closes the role filter menu', async () => {
        // Render UserFilters with no active role filter.
        render(
          <UserFilters
            search=""
            onSearchChange={() => {}}
            statusFilter={null}
            onStatusFilterChange={() => {}}
            roleFilter={null}
            onRoleFilterChange={() => {}}
          />
        );
        // Open the Role Filter menu.
        fireEvent.click(screen.getByLabelText('Role Filter'));
        await waitFor(() => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        });
        // Fire Escape key on the menu element instead of document.
        fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape', code: 'Escape' });
        await waitFor(() => {
          expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });
      });
      test('clearRoleFilter resets the role filter without closing the menu', async () => {
        const mockRoleFilterChange = vi.fn();
        // Render UserFilters with an active role filter (e.g. "admin")
        render(
          <UserFilters
            search=""
            onSearchChange={() => {}}
            statusFilter={null}
            onStatusFilterChange={() => {}}
            roleFilter="admin"
            onRoleFilterChange={mockRoleFilterChange}
          />
        );
        // Open the Role Filter menu.
        fireEvent.click(screen.getByLabelText('Role Filter'));
        await waitFor(() => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        });
        // Click the Clear Role Filter button.
        fireEvent.click(screen.getByLabelText('Clear Role Filter'));
        // Verify that the clear handler is called with null.
        expect(mockRoleFilterChange).toHaveBeenCalledWith(null);
        // And the menu remains open.
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      test('clearStatusFilter resets the status filter without closing the menu', async () => {
        const mockStatusFilterChange = vi.fn();
        // Render UserFilters with an active status filter (e.g. "Active")
        render(
          <UserFilters
            search=""
            onSearchChange={() => {}}
            statusFilter="Active"
            onStatusFilterChange={mockStatusFilterChange}
            roleFilter={null}
            onRoleFilterChange={() => {}}
          />
        );
        // Open the Status Filter menu.
        fireEvent.click(screen.getByLabelText('Status Filter'));
        await waitFor(() => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        });
        // Click the Clear Status Filter button.
        fireEvent.click(screen.getByLabelText('Clear Status Filter'));
        // Verify that the clear handler is called with null.
        expect(mockStatusFilterChange).toHaveBeenCalledWith(null);
        // And the menu remains open.
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

     
      
});

//Tests for UserFilter Component Functions
describe('Additional Filtering, Sorting, Pagination, and Status Update Tests', () => {
    // Custom test data
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
          refetch: vi.fn(),
          updateUserStatus: vi.fn(),
        }),
      }));
      const { default: UserPageCustom } = await import('./index');
      render(<UserPageCustom />);
  
      // Open the Role Filter menu
      fireEvent.click(screen.getByLabelText('Role Filter'));
      await waitFor(() => {
        expect(screen.getByText('Volunteer')).toBeInTheDocument();
      });
      // Click on the Volunteer option
      fireEvent.click(screen.getByText('Volunteer'));
  
      await waitFor(() => {
        const lastCall =
          mockSetFilteredData.mock.calls[mockSetFilteredData.mock.calls.length - 1][0];
        const names = lastCall.map((u) => u.name);
        // Expect only volunteer users (Alice and Bob) to remain after filtering
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
          refetch: vi.fn(),
          updateUserStatus: vi.fn(),
        }),
      }));
      const { default: UserPageCustom } = await import('./index');
      render(<UserPageCustom />);
  
      const nameHeader = screen.getByText('Name');
      // First click: toggle to ascending order; expected order: Alice, Bob, Charlie
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(mockSetFilteredData).toHaveBeenCalled();
      });
      let lastCall =
        mockSetFilteredData.mock.calls[mockSetFilteredData.mock.calls.length - 1][0];
      let names = lastCall.map((u) => u.name);
      expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
  
      // Second click: toggle to descending order; expected order: Charlie, Bob, Alice
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(mockSetFilteredData).toHaveBeenCalled();
      });
      lastCall = mockSetFilteredData.mock.calls[mockSetFilteredData.mock.calls.length - 1][0];
      names = lastCall.map((u) => u.name);
      expect(names).toEqual(['Charlie', 'Bob', 'Alice']);
  
      // Third click: return to original order (original customUsers order: Charlie, Alice, Bob)
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(mockSetFilteredData).toHaveBeenCalled();
      });
      lastCall = mockSetFilteredData.mock.calls[mockSetFilteredData.mock.calls.length - 1][0];
      names = lastCall.map((u) => u.name);
      expect(names).toEqual(['Charlie', 'Alice', 'Bob']);
    });
  
    test('changes page when pagination is used', async () => {
      // Create 11 items to have more than 1 page (10 items per page)
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
          refetch: vi.fn(),
          updateUserStatus: vi.fn(),
        }),
      }));
      const { default: UserPageCustom } = await import('./index');
      render(<UserPageCustom />);
      // According to MUI Pagination default, the button aria-label is "Go to page 2"
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go to page 2/i })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /go to page 2/i }));
      await waitFor(() => {
        // Page 2 should only display the 11th item
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
          refetch: vi.fn(),
          // Simulate successful update
          updateUserStatus: vi.fn().mockResolvedValue(undefined),
        }),
      }));
      const { default: UserPageCustom } = await import('./index');
      render(<UserPageCustom />);
      // Open the action menu for the first user
      const moreButtons = screen.getAllByLabelText('more');
      fireEvent.click(moreButtons[0]);
      await waitFor(() => {
        expect(screen.getByText(/Deactivate Role|Activate Role/)).toBeInTheDocument();
      });
      const statusToggleItem = screen.getByText(/Deactivate Role|Activate Role/);
      fireEvent.click(statusToggleItem);
      // Expect to see the success message
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
          refetch: vi.fn(),
          // Simulate failed update by throwing an error
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
      // Expect to see the error message
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Error updating user: Error: Test error');
      });
    });
  });
  