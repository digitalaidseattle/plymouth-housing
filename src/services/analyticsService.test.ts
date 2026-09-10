/**
 *  analyticsService.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getCheckoutItemTotals } from './analyticsService';
import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { getRole } from '../utils/userUtils';

vi.mock('../utils/userUtils', () => ({
  getRole: vi.fn(),
}));

global.fetch = vi.fn();

describe('analyticsService', () => {
  const user = { userDetails: 'testuser' } as any;
  const startDate = '2025-01-01';
  const endDate = '2025-01-31';

  beforeEach(() => {
    vi.clearAllMocks();
    (getRole as Mock).mockReturnValue('admin');
  });

  describe('getCheckoutItemTotals', () => {
    it('should fetch checkout item totals successfully', async () => {
      const rows = [
        {
          item_id: 1,
          item_name: 'Blanket',
          total_quantity: 5,
          checkout_count: 3,
        },
      ];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: rows }),
      });

      const result = await getCheckoutItemTotals(
        user,
        startDate,
        endDate,
        null,
      );

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.GET_CHECKOUT_ITEM_TOTALS, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'POST',
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
      expect(result).toEqual(rows);
    });

    it('should include building_id in the body when provided', async () => {
      const rows = [
        {
          item_id: 2,
          item_name: 'Towel',
          total_quantity: 2,
          checkout_count: 1,
        },
      ];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: rows }),
      });

      const result = await getCheckoutItemTotals(user, startDate, endDate, 4);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.GET_CHECKOUT_ITEM_TOTALS, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'POST',
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          building_id: 4,
        }),
      });
      expect(result).toEqual(rows);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
        clone: () => ({
          json: () => Promise.reject(new Error()),
          text: () => Promise.resolve(''),
        }),
      });

      await expect(
        getCheckoutItemTotals(user, startDate, endDate, null),
      ).rejects.toThrow('Internal Server Error');
    });
  });
});
