/**
 *  analyticsService.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { getRole } from '../utils/userUtils';
import { ENDPOINTS } from '../types/constants';
import {
  AnalyticsRangeData,
  ClientPrincipal,
  CheckoutItemTotal,
  DateRangeStrings,
} from '../types/interfaces';
import { onlyAdds } from '../utils/analyticsUtils';
import { getCheckoutHistory, getInventoryHistory } from './historyService';
import { apiRequest } from './apiRequest';

export async function getCheckoutItemTotals(
  user: ClientPrincipal | null,
  startDate: string,
  endDate: string,
  buildingId: number | null,
): Promise<CheckoutItemTotal[]> {
  try {
    const body: { start_date: string; end_date: string; building_id?: number } =
      {
        start_date: startDate,
        end_date: endDate,
      };
    if (buildingId !== null) {
      body.building_id = buildingId;
    }

    const result = await apiRequest<CheckoutItemTotal[]>({
      url: ENDPOINTS.GET_CHECKOUT_ITEM_TOTALS,
      role: getRole(user),
      method: 'POST',
      body,
    });
    return result.value;
  } catch (error) {
    console.error('Error fetching checkout item totals:', error);
    throw error;
  }
}

// Names the failing request when several are awaited together.
const labelled = <T>(label: string, request: Promise<T>): Promise<T> =>
  request.catch((error) => {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} (${reason})`);
  });

export const fetchRangeData = async (
  user: ClientPrincipal | null,
  current: DateRangeStrings,
  previous: DateRangeStrings,
): Promise<AnalyticsRangeData> => {
  const [currentRows, previousRows, inventory, previousInventory] =
    await Promise.all([
      labelled(
        'checkouts',
        getCheckoutHistory(user, current.startDate, current.endDate),
      ),
      labelled(
        'previous period checkouts',
        getCheckoutHistory(user, previous.startDate, previous.endDate),
      ),
      labelled(
        'inventory',
        getInventoryHistory(user, current.startDate, current.endDate),
      ),
      labelled(
        'previous period inventory',
        getInventoryHistory(user, previous.startDate, previous.endDate),
      ),
    ]);
  return {
    currentRows,
    previousRows,
    inventoryAdds: onlyAdds(inventory),
    previousInventoryAdds: onlyAdds(previousInventory),
  };
};
