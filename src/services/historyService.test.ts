import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getCheckoutHistory, getInventoryHistory } from './historyService';
import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { getRole } from '../utils/userUtils';
import { mapCheckoutRows, mapInventoryRows } from '../components/History/transactionProcessors';

vi.mock('../utils/userUtils', () => ({
  getRole: vi.fn(),
}));

vi.mock('../components/History/transactionProcessors', () => ({
  mapCheckoutRows: vi.fn(),
  mapInventoryRows: vi.fn(),
}));

global.fetch = vi.fn();

describe('historyService', () => {
  const user = { userDetails: 'testuser' } as any;
  const startDate = '2025-01-01';
  const endDate = '2025-01-31';

  beforeEach(() => {
    vi.clearAllMocks();
    (getRole as Mock).mockReturnValue('admin');
  });

  describe('getCheckoutHistory', () => {
    it('should fetch and map checkout history successfully', async () => {
      const rawRows = [{ id: 1, resident_name: 'Alice' }];
      const mappedRows = [{ id: 1, residentName: 'Alice' }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: rawRows }),
      });
      (mapCheckoutRows as Mock).mockReturnValue(mappedRows);

      const result = await getCheckoutHistory(user, startDate, endDate);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.GET_CHECKOUT_HISTORY, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'POST',
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
      expect(mapCheckoutRows).toHaveBeenCalledWith(rawRows);
      expect(result).toEqual(mappedRows);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getCheckoutHistory(user, startDate, endDate)).rejects.toThrow(
        'Internal Server Error',
      );
    });
  });

  describe('getInventoryHistory', () => {
    it('should fetch and map inventory history successfully', async () => {
      const rawRows = [{ id: 1, item_name: 'Blanket' }];
      const mappedRows = [{ id: 1, itemName: 'Blanket' }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: rawRows }),
      });
      (mapInventoryRows as Mock).mockReturnValue(mappedRows);

      const result = await getInventoryHistory(user, startDate, endDate);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.GET_INVENTORY_HISTORY, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'POST',
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
      expect(mapInventoryRows).toHaveBeenCalledWith(rawRows);
      expect(result).toEqual(mappedRows);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Gateway',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getInventoryHistory(user, startDate, endDate)).rejects.toThrow('Bad Gateway');
    });
  });
});
