/**
 *  Inventory.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Inventory from './index';
import { UserContext } from '../../components/contexts/UserContext';

// Navigation state under test, swapped per case.
const { navState } = vi.hoisted(() => ({
  navState: { current: null as unknown },
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    pathname: '/inventory',
    search: '',
    hash: '',
    key: 'test-key',
    state: navState.current,
  }),
}));

vi.mock('../../services/itemsService', () => ({
  getItems: vi.fn(async () => []),
  getCategories: vi.fn(async () => []),
}));

vi.mock('../../components/inventory/AddItemModal.tsx', () => ({
  default: ({ addModal, inventoryType }: any) => (
    <div data-testid="add-item-modal">
      {addModal ? 'Modal Open' : 'Modal Closed'} - type:{' '}
      {inventoryType ?? 'unset'}
    </div>
  ),
}));

vi.mock('../../components/inventory/AdjustQuantityModal.tsx', () => ({
  default: () => <div data-testid="adjust-quantity-modal" />,
}));

vi.mock('../../components/inventory/InventoryTable', () => ({
  default: () => <div data-testid="inventory-table" />,
}));

const mockUser = {
  userId: '1',
  userDetails: 'Test User',
  userRoles: ['volunteer'],
  claims: [],
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UserContext.Provider
    value={{
      user: mockUser,
      setUser: vi.fn(),
      loggedInUserId: 1,
      setLoggedInUserId: vi.fn(),
      activeVolunteers: [],
      setActiveVolunteers: vi.fn(),
      isLoading: false,
    }}
  >
    {children}
  </UserContext.Provider>
);

const renderInventory = (state: unknown) => {
  navState.current = state;
  return render(
    <Wrapper>
      <Inventory />
    </Wrapper>,
  );
};

const typeFilterText = (container: HTMLElement) =>
  container.querySelector('#type-button-container')?.textContent ?? '';

describe('Inventory navigation state', () => {
  beforeEach(() => {
    navState.current = null;
  });

  test('opens the add modal scoped to General when arriving from Add stock', async () => {
    const { container } = renderInventory({
      inventoryType: 'General',
      openAddModal: true,
    });

    await waitFor(() => {
      expect(typeFilterText(container)).toContain('General');
    });
    expect(screen.getByTestId('add-item-modal')).toHaveTextContent('Modal Open');
    expect(screen.getByTestId('add-item-modal')).toHaveTextContent(
      'type: General',
    );
  });

  test('scopes the table to Welcome Basket without opening the modal', async () => {
    const { container } = renderInventory({ inventoryType: 'Welcome Basket' });

    await waitFor(() => {
      expect(typeFilterText(container)).toContain('Welcome Basket');
    });
    expect(screen.getByTestId('add-item-modal')).toHaveTextContent(
      'Modal Closed',
    );
    expect(screen.getByTestId('add-item-modal')).toHaveTextContent(
      'type: Welcome Basket',
    );
  });

  test('leaves the filter and modal untouched with no navigation state', async () => {
    const { container } = renderInventory(null);

    await waitFor(() => {
      expect(screen.getByTestId('inventory-table')).toBeInTheDocument();
    });
    expect(typeFilterText(container)).toContain('Type');
    expect(screen.getByTestId('add-item-modal')).toHaveTextContent(
      'Modal Closed',
    );
    expect(screen.getByTestId('add-item-modal')).toHaveTextContent(
      'type: unset',
    );
  });

  test('shows the snackbar message carried in navigation state', async () => {
    renderInventory({ message: 'Item checked out' });

    await waitFor(() => {
      expect(screen.getByText('Item checked out')).toBeInTheDocument();
    });
  });
});
