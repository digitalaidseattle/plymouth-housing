import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getItems, createItem, updateItem } from './Items';
import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { getRole } from '../components/contexts/UserContext';

vi.mock('../components/contexts/UserContext', () => ({
  getRole: vi.fn(),
}));

global.fetch = vi.fn();

describe('Items', () => {
  const user = { userDetails: 'testuser' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getRole as Mock).mockReturnValue('admin');
  });

  describe('getItems', () => {
    it('returns items on success', async () => {
      const mockItems = [{ id: 1, name: 'Towel', category_id: 2 }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: mockItems }),
      });

      const result = await getItems(user);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.ITEMS + '?$first=10000', {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'GET',
      });
      expect(result).toEqual(mockItems);
    });

    it('returns empty array when value is missing', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await getItems(user);
      expect(result).toEqual([]);
    });

    it('throws startup message on 500', async () => {
      (fetch as Mock).mockResolvedValue({ ok: false, status: 500 });
      await expect(getItems(user)).rejects.toThrow('Database is likely starting up');
    });

    it('throws statusText on other errors', async () => {
      (fetch as Mock).mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' });
      await expect(getItems(user)).rejects.toThrow('Not Found');
    });
  });

  describe('createItem', () => {
    const newItem = {
      name: 'Blanket',
      type: 'general',
      category_id: 1,
      description: null,
      quantity: 0,
      threshold: 5,
      items_per_basket: null,
    };

    it('posts the item with correct shape', async () => {
      (fetch as Mock).mockResolvedValue({ ok: true });

      await createItem(user, newItem);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.ITEMS, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify(newItem),
      });
    });

    it('throws the error message from response body', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: { message: 'Duplicate item name' } }),
      });
      await expect(createItem(user, newItem)).rejects.toThrow('Duplicate item name');
    });

    it('falls back to statusText when error body has no message', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({}),
      });
      await expect(createItem(user, newItem)).rejects.toThrow('Bad Request');
    });
  });

  describe('updateItem', () => {
    it('patches the item at the correct URL', async () => {
      (fetch as Mock).mockResolvedValue({ ok: true });
      const updates = { name: 'Updated Blanket' };

      await updateItem(user, 42, updates);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.ITEMS}/id/42`, {
        method: 'PATCH',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify(updates),
      });
    });

    it('throws error message from response body on failure', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Server Error',
        json: () => Promise.resolve({ error: { message: 'Item not found' } }),
      });
      await expect(updateItem(user, 1, { name: 'x' })).rejects.toThrow('Item not found');
    });
  });
});
