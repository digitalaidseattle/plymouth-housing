import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import {
  getCategorizedItems,
  getItems,
  getCategories,
  createItem,
  updateItem,
} from './itemsService';
import { API_HEADERS, ENDPOINTS, SETTINGS } from '../types/constants';
import { getRole } from '../utils/userUtils';

vi.mock('../utils/userUtils', () => ({
  getRole: vi.fn(),
}));

describe('itemsService', () => {
  const user = { userDetails: 'testuser' } as any;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
    sessionStorage.clear();
    (getRole as Mock).mockReturnValue('admin');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getCategorizedItems', () => {
    it('should fetch categorized items successfully', async () => {
      const mockItems = [{ category: 'Clothing', items: [] }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: mockItems }),
      });

      const result = await getCategorizedItems(user);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CATEGORIZED_ITEMS, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'GET',
      });
      expect(result).toEqual(mockItems);
    });

    it('should return cached data on second call', async () => {
      const mockItems = [{ category: 'Clothing', items: [] }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: mockItems }),
      });

      const first = await getCategorizedItems(user);
      const second = await getCategorizedItems(user);

      expect(first).toEqual(mockItems);
      expect(second).toEqual(mockItems);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getCategorizedItems(user)).rejects.toThrow('Bad Request');
    });
  });

  describe('getItems', () => {
    it('should fetch items successfully', async () => {
      const mockItems = [{ id: 1, name: 'Blanket' }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: mockItems }),
      });

      const result = await getItems(user);

      expect(fetch).toHaveBeenCalledWith(
        `${ENDPOINTS.EXPANDED_ITEMS}?$first=${SETTINGS.api_fetch_limit_items}`,
        { headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' }, method: 'GET' },
      );
      expect(result).toEqual(mockItems);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getItems(user)).rejects.toThrow('Forbidden');
    });
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = [{ id: 1, name: 'Clothing' }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: mockCategories }),
      });

      const result = await getCategories(user);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CATEGORY, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'GET',
      });
      expect(result).toEqual(mockCategories);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getCategories(user)).rejects.toThrow('Unauthorized');
    });
  });

  describe('createItem', () => {
    const newItemData = { name: 'Pillow', category_id: 2 };

    it('should create an item successfully', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await createItem(user, newItemData);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.ITEMS, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify(newItemData),
      });
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(createItem(user, newItemData)).rejects.toThrow('Bad Request');
    });
  });

  describe('updateItem', () => {
    const itemId = 5;
    const updateData = { quantity: 10 };

    it('should update an item successfully', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await updateItem(user, itemId, updateData);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.ITEMS}/id/${itemId}`, {
        method: 'PATCH',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify(updateData),
      });
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(updateItem(user, itemId, updateData)).rejects.toThrow('Not Found');
    });
  });
});
