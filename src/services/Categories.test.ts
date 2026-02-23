import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getCategories, createCategory, updateCategory } from './Categories';
import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { getRole } from '../components/contexts/UserContext';

vi.mock('../components/contexts/UserContext', () => ({
  getRole: vi.fn(),
}));

global.fetch = vi.fn();

describe('Categories', () => {
  const user = { userDetails: 'testuser' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getRole as Mock).mockReturnValue('admin');
  });

  describe('getCategories', () => {
    it('maps checkout_limit to item_limit', async () => {
      const rawCategories = [{ id: 1, name: 'Clothing', checkout_limit: 5 }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: rawCategories }),
      });
      const result = await getCategories(user);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CATEGORY + '?$first=10000', {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'GET',
      });
      expect(result).toEqual([{ id: 1, name: 'Clothing', item_limit: 5 }]);
    });

    it('returns empty array when value is missing', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      const result = await getCategories(user);
      expect(result).toEqual([]);
    });

    it('throws startup message on 500', async () => {
      (fetch as Mock).mockResolvedValue({ ok: false, status: 500 });
      await expect(getCategories(user)).rejects.toThrow(
        'Database is likely starting up',
      );
    });

    it('throws statusText on other errors', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      await expect(getCategories(user)).rejects.toThrow('Not Found');
    });
  });

  describe('createCategory', () => {
    it('maps item_limit to checkout_limit in the request body', async () => {
      (fetch as Mock).mockResolvedValue({ ok: true });

      await createCategory(user, { name: 'Bedding', item_limit: 3 });

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CATEGORY, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({ name: 'Bedding', checkout_limit: 3 }),
      });
    });

    it('throws error message from response body on failure', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({ error: { message: 'Duplicate category name' } }),
      });
      await expect(
        createCategory(user, { name: 'Bedding', item_limit: 3 }),
      ).rejects.toThrow('Duplicate category name');
    });
  });

  describe('updateCategory', () => {
    it('maps item_limit to checkout_limit and patches the correct URL', async () => {
      (fetch as Mock).mockResolvedValue({ ok: true });

      await updateCategory(user, 7, { name: 'Toiletries', item_limit: 2 });

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.CATEGORY}/id/7`, {
        method: 'PATCH',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({ name: 'Toiletries', checkout_limit: 2 }),
      });
    });

    it('omits fields not present in updates', async () => {
      (fetch as Mock).mockResolvedValue({ ok: true });

      await updateCategory(user, 7, { name: 'Toiletries' });

      const call = (fetch as Mock).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body).toEqual({ name: 'Toiletries' });
      expect(body).not.toHaveProperty('checkout_limit');
    });

    it('throws error message from response body on failure', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        json: () =>
          Promise.resolve({ error: { message: 'Category not found' } }),
      });
      await expect(updateCategory(user, 7, { name: 'x' })).rejects.toThrow(
        'Category not found',
      );
    });
  });
});
