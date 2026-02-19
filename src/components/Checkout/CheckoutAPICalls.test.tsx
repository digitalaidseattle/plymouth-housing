
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  processWelcomeBasket,
  processGeneralItems,
  getBuildings,
  getUnitNumbers,
  getResidents,
  findResident,
  addResident,
  checkPastCheckout,
  getLastResidentVisit,
} from './CheckoutAPICalls';
import { API_HEADERS, ENDPOINTS, SETTINGS } from '../../types/constants';
import { getRole } from '../contexts/UserContext';

vi.mock('../contexts/UserContext', () => ({
  getRole: vi.fn(),
}));

global.fetch = vi.fn();

describe('CheckoutAPICalls', () => {
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
      });

      await expect(processWelcomeBasket(transactionID, user, loggedInUserId, sheetSetItem, residentInfo)).rejects.toThrow('Error');
    });

    it('should throw an error when transaction ID already exists', async () => {
      const duplicateErrorResponse = {
        value: [{
          Status: 'Error',
          message: 'Transaction already exists. GUID: 123e4567-e89b-12d3-a456-426614174000, Resident: John Doe, Building: B1, Unit: 101, Date: 2025-01-15 10:30:00'
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
      });

      await expect(processGeneralItems(transactionID, user, loggedInUserId, checkoutItems, residentInfo)).rejects.toThrow('Error');
    });

    it('should throw an error when transaction ID already exists', async () => {
      const duplicateErrorResponse = {
        value: [{
          Status: 'Error',
          message: 'Transaction already exists. GUID: 123e4567-e89b-12d3-a456-426614174000, Resident: Jane Smith, Building: A2, Unit: 205, Date: 2025-01-15 14:45:00'
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

  describe('getBuildings', () => {
    it('should fetch buildings successfully', async () => {
      const mockBuildings = { value: [{ id: 1, code: 'A' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBuildings),
      });

      const result = await getBuildings(user);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.BUILDINGS, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'GET',
      });
      expect(result).toEqual(mockBuildings.value);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
      });

      await expect(getBuildings(user)).rejects.toThrow('Error');
    });
  });

  describe('getUnitNumbers', () => {
    const buildingId = 1;

    it('should fetch unit numbers successfully', async () => {
      const mockUnits = { value: [{ id: 1, unit_number: '101' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUnits),
      });

      const result = await getUnitNumbers(user, buildingId);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.UNITS}?$filter=building_id eq ${buildingId}&$first=${SETTINGS.api_fetch_limit_units}`, {
        method: 'GET',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
      });
      expect(result).toEqual(mockUnits.value);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
      });

      await expect(getUnitNumbers(user, buildingId)).rejects.toThrow('Error');
    });
  });

  describe('getResidents', () => {
    const unitId = 1;

    it('should fetch residents successfully', async () => {
      const mockResidents = { value: [{ id: 1, name: 'John Doe' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResidents),
      });

      const result = await getResidents(user, unitId);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.RESIDENTS}?$filter=unit_id eq ${unitId}`, {
        method: 'GET',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
      });
      expect(result).toEqual(mockResidents);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
      });

      await expect(getResidents(user, unitId)).rejects.toThrow('Error');
    });
  });

  describe('findResident', () => {
    const unitId = 1;
    const name = "John's Doe";

    it('should find a resident successfully', async () => {
      const mockResident = { value: [{ id: 1, name: "John's Doe" }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResident),
      });

      const result = await findResident(user, name, unitId);
      const safeName = name.replace(/'/g, "''");
      const filter = encodeURIComponent(`name eq '${safeName}' and unit_id eq ${unitId}`);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.RESIDENTS}?$filter=${filter}`, {
        method: 'GET',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
      });
      expect(result).toEqual(mockResident);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
      });

      await expect(findResident(user, name, unitId)).rejects.toThrow('Error');
    });
  });

  describe('addResident', () => {
    const unitId = 1;
    const name = 'Jane Doe';

    it('should add a resident successfully', async () => {
      const mockResponse = { id: 2, name: 'Jane Doe' };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await addResident(user, name, unitId);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.RESIDENTS, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({
          name: name,
          unit_id: unitId,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
      });

      await expect(addResident(user, name, unitId)).rejects.toThrow('Error');
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
      });

      await expect(checkPastCheckout(user, residentId)).rejects.toThrow('Error');
    });
  });

  describe('getLastResidentVisit', () => {
    const residentId = 1;

    it('should fetch last resident visit successfully', async () => {
      const mockResponse = { value: [{ transaction_date: '2025-01-15T10:30:00' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getLastResidentVisit(user, residentId);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.GET_LAST_RESIDENT_VISIT, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({ resident_id: residentId }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty result when resident has no visits', async () => {
      const mockResponse = { value: [] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getLastResidentVisit(user, residentId);

      expect(result).toEqual(mockResponse);
      expect(result.value).toEqual([]);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
      });

      await expect(getLastResidentVisit(user, residentId)).rejects.toThrow('Error');
    });
  });
});
