import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { processInventoryChange, processInventoryResetQuantity } from './inventoryService';
import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { getRole } from '../utils/userUtils';

vi.mock('../utils/userUtils', () => ({
  getRole: vi.fn(),
}));

global.fetch = vi.fn();

describe('inventoryService', () => {
  const user = { userDetails: 'testuser' } as any;
  const userId = 1;
  const transactionId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    vi.clearAllMocks();
    (getRole as Mock).mockReturnValue('admin');
  });

  describe('processInventoryChange', () => {
    const items = [{ id: 10, quantity: 3 }];

    it('should process inventory change successfully', async () => {
      const mockResult = { value: [{ id: 10, new_quantity: 7 }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await processInventoryChange(user, userId, items, transactionId);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.PROCESS_INVENTORY_CHANGE, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({
          user_id: userId,
          item: items,
          new_transaction_id: transactionId,
        }),
      });
      expect(result).toEqual(mockResult.value);
    });

    it('should return empty array when result.value is absent', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ someOtherKey: 'data' }),
      });

      const result = await processInventoryChange(user, userId, items, transactionId);

      expect(result).toEqual([]);
    });

    it('should throw when result is null', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      });

      await expect(processInventoryChange(user, userId, items, transactionId)).rejects.toThrow(
        'Response contained no data',
      );
    });

    it('should throw when result contains an error field', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ error: { message: 'Insufficient stock' } }),
      });

      await expect(processInventoryChange(user, userId, items, transactionId)).rejects.toThrow(
        'Insufficient stock',
      );
    });

    it('should throw generic error when error field has no message', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ error: {} }),
      });

      await expect(processInventoryChange(user, userId, items, transactionId)).rejects.toThrow(
        'An unknown error occurred',
      );
    });

    it('should throw an error if the HTTP request fails', async () => {
      (fetch as Mock).mockResolvedValue({ ok: false, statusText: 'Bad Request' });

      await expect(processInventoryChange(user, userId, items, transactionId)).rejects.toThrow(
        'Bad Request',
      );
    });
  });

  describe('processInventoryResetQuantity', () => {
    const itemId = 10;
    const newQuantity = 50;
    const additionalNotes = 'Recount after donation';

    it('should reset item quantity successfully', async () => {
      const mockResult = { value: [{ id: 10, quantity: 50 }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await processInventoryResetQuantity(
        user, userId, itemId, newQuantity, additionalNotes, transactionId,
      );

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.PROCESS_INVENTORY_RESET_QUANTITY, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({
          user_id: userId,
          item_id: itemId,
          new_quantity: newQuantity,
          additional_notes: additionalNotes,
          new_transaction_id: transactionId,
        }),
      });
      expect(result).toEqual(mockResult.value);
    });

    it('should return empty array when response has no value', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      });

      const result = await processInventoryResetQuantity(
        user, userId, itemId, newQuantity, additionalNotes, transactionId,
      );

      expect(result).toEqual([]);
    });

    it('should throw an error if the HTTP request fails', async () => {
      (fetch as Mock).mockResolvedValue({ ok: false, statusText: 'Internal Server Error' });

      await expect(
        processInventoryResetQuantity(user, userId, itemId, newQuantity, additionalNotes, transactionId),
      ).rejects.toThrow('Internal Server Error');
    });
  });
});
