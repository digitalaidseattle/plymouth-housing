import  { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserContext } from '../../components/contexts/UserContext';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import UserPage from './index';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import useUsers from './useUsers';
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
      />
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
      />
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
      />
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
      />
    );
    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[1]);
    await waitFor(() =>
      expect(screen.getByText('Show PIN')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText('Show PIN'));
    await waitFor(() =>
      expect(screen.getByText('Pin code:')).toBeInTheDocument()
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
      />
    );
    fireEvent.click(screen.getAllByRole('button', { name: /more/i })[1]);
    await waitFor(() =>
      expect(screen.getByText('Show PIN')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText('Show PIN'));
    await waitFor(() =>
      expect(screen.getByText(/pin not available/i)).toBeInTheDocument()
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
        />
      );
      fireEvent.change(screen.getByPlaceholderText('Search...'), {
        target: { value: 'John' },
      });
      expect(handleSearchChange).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('UserTable Component', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'John Doe', role: 'admin', active: true, created_at: new Date().toISOString(), last_signed_in: new Date().toISOString(), PIN: null },
      { id: 2, name: 'Jane Smith', role: 'volunteer', active: false, created_at: new Date().toISOString(), last_signed_in: new Date().toISOString(), PIN: '5678' },
    ];
  
    test('renders user list', () => {
      render(
        <UserTable
          users={mockUsers}
          nameOrder="original"
          onNameOrderToggle={vi.fn()}
          onStatusToggle={vi.fn()}
        />
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
        />
      );
      fireEvent.click(screen.getAllByRole('button', { name: /more/i })[0]);
      fireEvent.click(screen.getByText('Deactivate Role'));
      expect(mockToggle).toHaveBeenCalledWith(1);
    });
  

});
});
