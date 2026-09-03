/**
 *  index.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminHome from './index';
import { UserContext } from '../../components/contexts/UserContext';
import * as historyService from '../../services/historyService';
import * as analyticsService from '../../services/analyticsService';
import * as itemsService from '../../services/itemsService';
import * as residentService from '../../services/residentService';
import {
  CheckoutTransaction,
  CheckoutItemTotal,
  InventoryItem,
  Building,
} from '../../types/interfaces';

vi.mock('../../services/historyService');
vi.mock('../../services/analyticsService');
vi.mock('../../services/itemsService');
vi.mock('../../services/residentService');
vi.mock('../../components/History/CustomDateDialog', () => ({
  default: () => null,
}));

const mockUser = {
  userId: '1',
  userDetails: 'Test Admin',
  userRoles: ['admin'],
  claims: [],
};

// Alice appears twice in Building A (the duplicate); Bob appears once in Building B.
const mockCurrentTransactions: CheckoutTransaction[] = [
  {
    transaction_id: 'txn-1',
    user_id: 1,
    building_id: 1,
    building_code: 'A',
    building_name: 'Building A',
    unit_number: '101',
    resident_id: 1,
    resident_name: 'Alice Resident',
    transaction_date: '2026-08-05T12:00:00.000Z',
    item_type: 'general',
    total_quantity: 3,
    welcome_basket_item_id: null,
    welcome_basket_quantity: null,
    is_edited: false,
  },
  {
    transaction_id: 'txn-2',
    user_id: 1,
    building_id: 1,
    building_code: 'A',
    building_name: 'Building A',
    unit_number: '101',
    resident_id: 1,
    resident_name: 'Alice Resident',
    transaction_date: '2026-08-10T12:00:00.000Z',
    item_type: 'general',
    total_quantity: 2,
    welcome_basket_item_id: null,
    welcome_basket_quantity: null,
    is_edited: false,
  },
  {
    transaction_id: 'txn-3',
    user_id: 2,
    building_id: 2,
    building_code: 'B',
    building_name: 'Building B',
    unit_number: '202',
    resident_id: 2,
    resident_name: 'Bob Resident',
    transaction_date: '2026-08-12T12:00:00.000Z',
    item_type: 'general',
    total_quantity: 5,
    welcome_basket_item_id: null,
    welcome_basket_quantity: null,
    is_edited: false,
  },
];

const mockItemTotals: CheckoutItemTotal[] = [
  {
    item_id: 101,
    item_name: 'Winter Coats',
    total_quantity: 12,
    checkout_count: 4,
  },
  { item_id: 102, item_name: 'Diapers', total_quantity: 8, checkout_count: 3 },
];

// Space Heater is at/below threshold; Pillows is not, so it should be excluded
// from the Low Stock panel. Item ids intentionally don't match mockItemTotals,
// so the "Checked Out (This Range)" column falls back to an em dash.
const mockItems: InventoryItem[] = [
  {
    id: 1,
    name: 'Space Heater',
    type: 'General',
    description: '',
    quantity: 1,
    threshold: 5,
    category: 'Appliances',
    status: 'Low Stock',
  },
  {
    id: 2,
    name: 'Pillows',
    type: 'General',
    description: '',
    quantity: 40,
    threshold: 5,
    category: 'Bedding',
    status: 'In Stock',
  },
];

const mockBuildings: Building[] = [
  { id: 1, code: 'A', name: 'Building A' },
  { id: 2, code: 'B', name: 'Building B' },
];

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    <UserContext.Provider
      value={{
        user: mockUser,
        setUser: vi.fn(),
        loggedInUserId: 1,
        setLoggedInUserId: vi.fn(),
        activeVolunteers: [],
        setActiveVolunteers: vi.fn(),
        isLoading: false,
        pinVerified: false,
        setPinVerified: vi.fn(),
      }}
    >
      {children}
    </UserContext.Provider>
  </MemoryRouter>
);

describe('AdminHome Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Same transactions are returned for both the current and previous period
    // fetches; only the current-period math is asserted here.
    vi.spyOn(historyService, 'getCheckoutHistory').mockResolvedValue(
      mockCurrentTransactions,
    );
    vi.spyOn(analyticsService, 'getCheckoutItemTotals').mockResolvedValue(
      mockItemTotals,
    );
    vi.spyOn(itemsService, 'getItems').mockResolvedValue(mockItems);
    vi.spyOn(residentService, 'getBuildings').mockResolvedValue(mockBuildings);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const findTileCard = async (label: string): Promise<HTMLElement> => {
    const labelEl = await screen.findByText(label);
    return labelEl.closest('.MuiCard-root') as HTMLElement;
  };

  test('renders tiles with computed values', async () => {
    render(
      <Wrapper>
        <AdminHome />
      </Wrapper>,
    );

    const residentsTile = await findTileCard('Residents Served');
    expect(within(residentsTile).getByText('2')).toBeInTheDocument();

    const itemsTile = await findTileCard('Items Checked Out');
    expect(within(itemsTile).getByText('10')).toBeInTheDocument();
  });

  test('renders Top 10 Items Checked Out and Residents Served by Building panels', async () => {
    render(
      <Wrapper>
        <AdminHome />
      </Wrapper>,
    );

    const itemsPanel = (
      await screen.findByText('Top 10 Items Checked Out')
    ).closest('.MuiCard-root') as HTMLElement;
    expect(within(itemsPanel).getByText('Winter Coats')).toBeInTheDocument();
    expect(within(itemsPanel).getByText('Diapers')).toBeInTheDocument();

    const buildingsPanel = screen
      .getByText('Residents Served by Building')
      .closest('.MuiCard-root') as HTMLElement;
    expect(within(buildingsPanel).getByText('A')).toBeInTheDocument();
    expect(within(buildingsPanel).getByText('B')).toBeInTheDocument();
  });

  test('shows the at/below-threshold item with its status chip in Low Stock table', async () => {
    render(
      <Wrapper>
        <AdminHome />
      </Wrapper>,
    );

    const lowStockPanel = (
      await screen.findByText('Low Stock & High Need')
    ).closest('.MuiCard-root') as HTMLElement;
    expect(within(lowStockPanel).getByText('Space Heater')).toBeInTheDocument();
    expect(within(lowStockPanel).getByText('Low Stock')).toBeInTheDocument();
    expect(
      within(lowStockPanel).queryByText('Pillows'),
    ).not.toBeInTheDocument();
  });

  test('detail table renders and flags the duplicate resident with a Repeat chip', async () => {
    render(
      <Wrapper>
        <AdminHome />
      </Wrapper>,
    );

    const detailPanel = (
      await screen.findByText('Residents Served — Detail')
    ).closest('.MuiCard-root') as HTMLElement;
    const aliceRows = within(detailPanel).getAllByText('Alice Resident');
    expect(aliceRows).toHaveLength(2);
    expect(within(detailPanel).getAllByText('Repeat')).toHaveLength(2);

    const bobRow = within(detailPanel)
      .getByText('Bob Resident')
      .closest('tr') as HTMLElement;
    expect(within(bobRow).queryByText('Repeat')).not.toBeInTheDocument();
  });

  test('toggling "Repeats only" hides the non-duplicate rows', async () => {
    render(
      <Wrapper>
        <AdminHome />
      </Wrapper>,
    );

    const detailPanel = (
      await screen.findByText('Residents Served — Detail')
    ).closest('.MuiCard-root') as HTMLElement;
    expect(within(detailPanel).getByText('Bob Resident')).toBeInTheDocument();

    const repeatsOnlySwitch = within(detailPanel).getByRole('switch', {
      name: /repeats only/i,
    });
    fireEvent.click(repeatsOnlySwitch);

    expect(
      within(detailPanel).queryByText('Bob Resident'),
    ).not.toBeInTheDocument();
    expect(within(detailPanel).getAllByText('Alice Resident')).toHaveLength(2);
  });

  test('changing the building filter narrows the detail rows to that building', async () => {
    render(
      <Wrapper>
        <AdminHome />
      </Wrapper>,
    );

    expect(
      within(
        (await screen.findByText('Residents Served — Detail')).closest(
          '.MuiCard-root',
        ) as HTMLElement,
      ).getByText('Bob Resident'),
    ).toBeInTheDocument();

    const buildingSelect = screen.getByRole('combobox', { name: /building/i });
    fireEvent.mouseDown(buildingSelect);
    const buildingAOption = await screen.findByRole('option', {
      name: 'Building A',
    });
    fireEvent.click(buildingAOption);

    // Changing the building refetches (isLoading briefly flips), so re-query
    // the panel after the update rather than reusing the earlier node.
    const updatedDetailPanel = (
      await screen.findByText('Residents Served — Detail')
    ).closest('.MuiCard-root') as HTMLElement;
    expect(
      await within(updatedDetailPanel).findAllByText('Alice Resident'),
    ).toHaveLength(2);
    expect(
      within(updatedDetailPanel).queryByText('Bob Resident'),
    ).not.toBeInTheDocument();
  });

  test('shows an enabled Export CSV button', async () => {
    render(
      <Wrapper>
        <AdminHome />
      </Wrapper>,
    );

    await screen.findByText('Residents Served — Detail');
    const exportButton = screen.getByRole('button', { name: /export csv/i });
    expect(exportButton).toBeEnabled();
  });
});
