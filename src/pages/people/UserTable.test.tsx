import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import UserTable from './UserTable';
import { User } from '../../types/interfaces';

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
        PIN: '', // when PIN is empty string
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
});
