import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import UserFilters from './UserFilters';

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

  test('handleRoleClose closes the role filter menu', async () => {
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
    // open the role filter menu
    fireEvent.click(screen.getByLabelText('Role Filter'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    // simulate pressing the escape key
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  test('clearRoleFilter resets the role filter without closing the menu', async () => {
    const mockRoleFilterChange = vi.fn();
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
    fireEvent.click(screen.getByLabelText('Role Filter'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('Clear Role Filter'));
    expect(mockRoleFilterChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  test('clearStatusFilter resets the status filter without closing the menu', async () => {
    const mockStatusFilterChange = vi.fn();
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
    fireEvent.click(screen.getByLabelText('Status Filter'));
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('Clear Status Filter'));
    expect(mockStatusFilterChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
