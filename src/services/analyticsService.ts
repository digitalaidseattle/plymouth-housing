/**
 *  analyticsService.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { getRole } from '../utils/userUtils';
import { ENDPOINTS } from '../types/constants';
import { ClientPrincipal, CheckoutItemTotal } from '../types/interfaces';
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
