/**
 *  index.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Analytics from './index';
import { UserContext } from '../../components/contexts/UserContext';
import * as historyService from '../../services/historyService';
import * as analyticsService from '../../services/analyticsService';
import * as itemsService from '../../services/itemsService';
import * as residentService from '../../services/residentService';
import {
  CheckoutTransaction,
  CheckoutItemTotal,
  InventoryItem,
  InventoryTransaction,
  Building,
  TransactionType,
} from '../../types/interfaces';

vi.mock('../../services/historyService');
// Partial: fetchRangeData stays real so it still calls the mocked history service.
vi.mock('../../services/analyticsService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/analyticsService')>()),
  getCheckoutItemTotals: vi.fn(),
}));
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
// so the "Checked Out" column falls back to 0.
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

const mockInventoryHistory: InventoryTransaction[] = [
  {
    transaction_id: 'inv-1',
    user_id: 1,
    transaction_type: TransactionType.InventoryAdd,
    transaction_date: '2026-08-06T09:00:00.000Z',
    item_name: 'Blankets',
    category_name: 'Bedding',
    quantity: 24,
  },
  {
    transaction_id: 'inv-2',
    user_id: 1,
    transaction_type: TransactionType.InventoryReplaceValue,
    transaction_date: '2026-08-07T09:00:00.000Z',
    item_name: 'Mugs',
    category_name: 'Kitchen',
    quantity: 5,
  },
];

const renderAnalytics = () =>
  render(
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
        <Analytics onError={vi.fn()} />
      </UserContext.Provider>
    </MemoryRouter>,
  );

describe('Analytics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The page caches its fetches in session storage; each test starts cold.
    sessionStorage.clear();
    // Same transactions are returned for both the current and previous period
    // fetches; only the current-period math is asserted here.
    vi.spyOn(historyService, 'getCheckoutHistory').mockResolvedValue(
      mockCurrentTransactions,
    );
    vi.spyOn(historyService, 'getInventoryHistory').mockResolvedValue(
      mockInventoryHistory,
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

  // The stat-tile label is a <p>; scoped by selector so it doesn't collide
  // with the "Residents Served" table heading (<h5>).
  const findTileCard = async (label: string): Promise<HTMLElement> => {
    const labelEl = await screen.findByText(label, { selector: 'p' });
    return labelEl.closest('.MuiCard-root') as HTMLElement;
  };

  const findDetailPanel = async (): Promise<HTMLElement> => {
    const heading = await screen.findByRole('heading', {
      name: 'Residents Served',
    });
    return heading.closest('.MuiCard-root') as HTMLElement;
  };

  test('renders tiles with computed values', async () => {
    renderAnalytics();

    const residentsTile = await findTileCard('Residents Served');
    expect(within(residentsTile).getByText('2')).toBeInTheDocument();

    const itemsTile = await findTileCard('Items Checked Out');
    expect(within(itemsTile).getByText('10')).toBeInTheDocument();
  });

  test('totals only InventoryAdd quantity in the Items Added tile', async () => {
    renderAnalytics();

    // 24 from the InventoryAdd row; the InventoryReplaceValue row's 5 is excluded.
    const addedTile = await findTileCard('Items Added');
    expect(within(addedTile).getByText('24')).toBeInTheDocument();
  });

  test('renders Top 10 Items Checked Out and Residents Served by Building panels', async () => {
    renderAnalytics();

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
    renderAnalytics();

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
    renderAnalytics();

    const detailPanel = await findDetailPanel();
    const aliceRows = within(detailPanel).getAllByText('Alice Resident');
    expect(aliceRows).toHaveLength(2);
    expect(within(detailPanel).getAllByText('Repeat')).toHaveLength(2);

    const bobRow = within(detailPanel)
      .getByText('Bob Resident')
      .closest('tr') as HTMLElement;
    expect(within(bobRow).queryByText('Repeat')).not.toBeInTheDocument();
  });

  test('toggling "Repeats only" hides the non-duplicate rows', async () => {
    renderAnalytics();

    const detailPanel = await findDetailPanel();
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
    renderAnalytics();

    expect(
      within(await findDetailPanel()).getByText('Bob Resident'),
    ).toBeInTheDocument();

    const buildingSelect = screen.getByRole('combobox', { name: /building/i });
    fireEvent.mouseDown(buildingSelect);
    const buildingAOption = await screen.findByRole('option', {
      name: 'Building A',
    });
    fireEvent.click(buildingAOption);

    // Changing the building refetches (isLoading briefly flips), so re-query
    // the panel after the update rather than reusing the earlier node.
    const updatedDetailPanel = await findDetailPanel();
    expect(
      await within(updatedDetailPanel).findAllByText('Alice Resident'),
    ).toHaveLength(2);
    expect(
      within(updatedDetailPanel).queryByText('Bob Resident'),
    ).not.toBeInTheDocument();
  });

  test('serves a remount from cache and refetches when Refresh is clicked', async () => {
    const { unmount } = renderAnalytics();
    await findDetailPanel();
    const callsAfterFirstLoad = vi.mocked(historyService.getCheckoutHistory)
      .mock.calls.length;
    unmount();

    renderAnalytics();
    await findDetailPanel();
    expect(historyService.getCheckoutHistory).toHaveBeenCalledTimes(
      callsAfterFirstLoad,
    );

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    await waitFor(() =>
      expect(
        vi.mocked(historyService.getCheckoutHistory).mock.calls.length,
      ).toBeGreaterThan(callsAfterFirstLoad),
    );
  });

  test('shows an enabled Export button', async () => {
    renderAnalytics();

    await findDetailPanel();
    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeEnabled();
  });

  test('omits the per-day average from the Checkouts tile for a single-day range', async () => {
    renderAnalytics();

    const tile = await findTileCard('Checkouts');
    expect(within(tile).getByText('3')).toBeInTheDocument();
    expect(within(tile).queryByText(/\/ active day/)).not.toBeInTheDocument();
  });

  test('shows the per-day average beside the total once the range spans days', async () => {
    renderAnalytics();
    await findDetailPanel();

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /date/i }));
    fireEvent.click(await screen.findByRole('option', { name: 'This Week' }));

    // The 3 checkouts land on 3 separate days, and quiet days are not counted.
    const tile = await findTileCard('Checkouts');
    expect(await within(tile).findByText('1.0 / active day')).toBeInTheDocument();
  });

  test('charts only InventoryAdd rows in Top Inventory Items Added', async () => {
    renderAnalytics();

    const panel = (
      await screen.findByRole('heading', {
        name: 'Top 10 Inventory Items Added',
      })
    ).closest('.MuiCard-root') as HTMLElement;
    expect(within(panel).getByText('Blankets')).toBeInTheDocument();
    expect(within(panel).getByText('24')).toBeInTheDocument();
    expect(within(panel).queryByText('Mugs')).not.toBeInTheDocument();
  });

  test('offers a current-inventory export in the split-button menu', async () => {
    renderAnalytics();

    await findDetailPanel();
    fireEvent.click(
      screen.getByRole('button', { name: /more export options/i }),
    );
    expect(
      await screen.findByRole('menuitem', {
        name: /export current inventory/i,
      }),
    ).toBeInTheDocument();
  });

  test('lists a never-checked-out item in Least Checked Out Items but not in Top 10 Items Checked Out', async () => {
    // In the catalog but absent from the totals, so it never moved in this range.
    vi.spyOn(itemsService, 'getItems').mockResolvedValue([
      ...mockItems,
      {
        id: 3,
        name: 'Unused Umbrella',
        type: 'General',
        description: '',
        quantity: 20,
        threshold: 5,
        category: 'Miscellaneous',
        status: 'In Stock',
      },
    ]);
    vi.spyOn(analyticsService, 'getCheckoutItemTotals').mockResolvedValue([
      {
        item_id: 1,
        item_name: 'Space Heater',
        total_quantity: 12,
        checkout_count: 4,
      },
      {
        item_id: 2,
        item_name: 'Pillows',
        total_quantity: 8,
        checkout_count: 3,
      },
    ]);

    renderAnalytics();

    const leastPanel = (
      await screen.findByText('Least Checked Out Items')
    ).closest('.MuiCard-root') as HTMLElement;
    expect(within(leastPanel).getByText('Unused Umbrella')).toBeInTheDocument();

    const topPanel = screen
      .getByText('Top 10 Items Checked Out')
      .closest('.MuiCard-root') as HTMLElement;
    expect(
      within(topPanel).queryByText('Unused Umbrella'),
    ).not.toBeInTheDocument();
  });

  test('empties Top 10 Items Checked Out but still lists the catalog as least checked out when nothing moved', async () => {
    vi.spyOn(analyticsService, 'getCheckoutItemTotals').mockResolvedValue([]);

    renderAnalytics();

    const topPanel = (
      await screen.findByText('Top 10 Items Checked Out')
    ).closest('.MuiCard-root') as HTMLElement;
    expect(
      within(topPanel).getByText(/No checkouts in the selected date range/),
    ).toBeInTheDocument();

    const leastPanel = screen
      .getByText('Least Checked Out Items')
      .closest('.MuiCard-root') as HTMLElement;
    expect(within(leastPanel).getByText('Space Heater')).toBeInTheDocument();
    expect(within(leastPanel).getByText('Pillows')).toBeInTheDocument();
    expect(
      within(topPanel).queryByText('Winter Coats'),
    ).not.toBeInTheDocument();
  });

  test('detail table shows the per-resident visit count in the # Visits column', async () => {
    renderAnalytics();

    const detailPanel = await findDetailPanel();
    const aliceRows = within(detailPanel).getAllByText('Alice Resident');
    aliceRows.forEach((nameEl) => {
      const row = nameEl.closest('tr') as HTMLElement;
      const cells = within(row).getAllByRole('cell');
      // Resident, Building, Unit, # Visits, # Items, Transaction Date
      expect(cells[3]).toHaveTextContent('2');
    });

    const bobRow = within(detailPanel)
      .getByText('Bob Resident')
      .closest('tr') as HTMLElement;
    const bobCells = within(bobRow).getAllByRole('cell');
    expect(bobCells[3]).toHaveTextContent('1');
  });

  test("shows each building's residents and visits beside the bar", async () => {
    renderAnalytics();

    const buildingsPanel = (
      await screen.findByText('Residents Served by Building')
    ).closest('.MuiCard-root') as HTMLElement;

    expect(
      within(buildingsPanel).getByText('residents / visits'),
    ).toBeInTheDocument();

    const labelBox = within(buildingsPanel)
      .getByText('A')
      .parentElement as HTMLElement;
    // The counts sit in the value column, not under the building name.
    expect(labelBox).not.toHaveTextContent('2');

    const barValueEl = labelBox.nextElementSibling
      ?.nextElementSibling as HTMLElement;
    expect(barValueEl).toHaveTextContent('1 / 2');
  });
});
