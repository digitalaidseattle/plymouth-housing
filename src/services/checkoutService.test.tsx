
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  processWelcomeBasket,
  processGeneralItems,
  checkPastCheckout,
} from './checkoutService';
import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { getRole } from '../utils/userUtils';

vi.mock('../utils/userUtils', () => ({
  getRole: vi.fn(),
}));

global.fetch = vi.fn();

describe('checkoutService', () => {
  const user = { userDetails: 'testuser' } as any;
  const loggedInUserId = 1;
  const residentInfo = { id: 1, name: 'John Doe', unit: { id: 1, unit_number: '1'}, building: { id: 1, name: 'building', code: 'B1'} };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (getRole as Mock).mockReturnValue('admin');
  });

  describe('processWelcomeBasket', () => {
    const sheetSetItem = { id: 1, quantity: 1, name: 'Twin-size Sheet Set', description: 'test', additional_notes: '' };
    const transactionID = '123e4567-e89b-12d3-a456-426614174000';

    it('should process welcome basket successfully', async () => {
      const mockResponse = { success: true };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await processWelcomeBasket(transactionID, user, loggedInUserId, sheetSetItem, residentInfo);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CHECKOUT_WELCOME_BASKET, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({
          new_transaction_id: transactionID,
          user_id: loggedInUserId,
          mattress_size: sheetSetItem.id,
          quantity: sheetSetItem.quantity,
          resident_id: residentInfo.id,
          message: '',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(processWelcomeBasket(transactionID, user, loggedInUserId, sheetSetItem, residentInfo)).rejects.toThrow('Error');
    });

    it('should return error response when transaction ID already exists', async () => {
      const duplicateErrorResponse = {
        value: [{
          Status: 'Error',
          ErrorCode: 'DUPLICATE_TRANSACTION',
          message: 'Transaction with this ID already exists.'
        }]
      };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(duplicateErrorResponse),
      });

      const result = await processWelcomeBasket(transactionID, user, loggedInUserId, sheetSetItem, residentInfo);

      expect(result).toEqual(duplicateErrorResponse);
    });
  });

  describe('processGeneralItems', () => {
    const checkoutItems = [{ id: 1, quantity: 1, name: 'Item 1', description: 'test', additional_notes: 'note' }];
    const transactionID = '123e4567-e89b-12d3-a456-426614174000';

    it('should process general items successfully', async () => {
      const mockResponse = { success: true };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await processGeneralItems(transactionID, user, loggedInUserId, checkoutItems, residentInfo);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CHECKOUT_GENERAL_ITEMS, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({
          new_transaction_id: transactionID,
          user_id: loggedInUserId,
          items: checkoutItems.map((item) => ({ id: item.id, quantity: item.quantity, additional_notes: item.additional_notes })),
          resident_id: residentInfo.id,
          message: '',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(processGeneralItems(transactionID, user, loggedInUserId, checkoutItems, residentInfo)).rejects.toThrow('Error');
    });

    it('should return error response when transaction ID already exists', async () => {
      const duplicateErrorResponse = {
        value: [{
          Status: 'Error',
          ErrorCode: 'DUPLICATE_TRANSACTION',
          message: 'Transaction with this ID already exists.'
        }]
      };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(duplicateErrorResponse),
      });

      const result = await processGeneralItems(transactionID, user, loggedInUserId, checkoutItems, residentInfo);

      expect(result).toEqual(duplicateErrorResponse);
    });
  });

  describe('checkPastCheckout', () => {
    const residentId = 1;

    it('should check for past checkout successfully', async () => {
      const mockResponse = { has_past_checkout: false };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await checkPastCheckout(user, residentId);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CHECK_PAST_CHECKOUT, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({
          resident_id: residentId,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(checkPastCheckout(user, residentId)).rejects.toThrow('Error');
    });
  });
});
