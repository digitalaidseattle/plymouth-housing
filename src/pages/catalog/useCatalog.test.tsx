import { renderHook, act, waitFor } from '@testing-library/react';
import { useCatalog } from './useCatalog';
import { UserContext } from '../../components/contexts/UserContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ENDPOINTS } from '../../types/constants';

const dummyUser = {
  userID: "1",
  userDetails: "Test Admin",
  userRoles: ["admin"],
  claims: []
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserContext.Provider
    value={{
      user: dummyUser,
      setUser: vi.fn(),
      loggedInUserId: 1,
      setLoggedInUserId: vi.fn(),
      activeVolunteers: [],
      setActiveVolunteers: vi.fn(),
      isLoading: false
    }}
  >
    {children}
  </UserContext.Provider>
);

describe('useCatalog hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('initializes with loading state', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useCatalog(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);
    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('fetches items and categories successfully', async () => {
    const mockItems = [
      { id: 1, name: 'Item One', type: 'General', category_id: 1, description: 'Test', quantity: 10, threshold: 5, items_per_basket: null },
    ];
    const mockCategories = [
      { id: 1, name: 'Food', checkout_limit: 3 },
    ];

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: mockItems }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: mockCategories }),
      });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.items).toHaveLength(1);
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.items[0].category_name).toBe('Food');
  });

  it('handles fetch error with 500 status', async () => {
    // fetchData calls Promise.all with both fetchItems and fetchCategories
    // If one fails, the whole Promise.all fails
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Database is likely starting up. Try again in 30 seconds.'));

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toContain('Database is likely starting up');
    expect(result.current.items).toEqual([]);
  });

  it('updates an item successfully', async () => {
    const mockItems = [
      { id: 1, name: 'Old Name', type: 'General', category_id: 1, description: 'Test', quantity: 10, threshold: 5, items_per_basket: null },
    ];
    const mockCategories = [{ id: 1, name: 'Food', checkout_limit: 3 }];

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: mockItems }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: mockCategories }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateItem(1, { name: 'New Name' });
    });

    expect(result.current.items[0].name).toBe('New Name');
  });

  it('updates a category and item category names', async () => {
    const mockItems = [
      { id: 1, name: 'Item', type: 'General', category_id: 1, description: 'Test', quantity: 10, threshold: 5, items_per_basket: null },
    ];
    const mockCategories = [{ id: 1, name: 'Old Category', checkout_limit: 3 }];

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: mockItems }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: mockCategories }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateCategory(1, { name: 'New Category' });
    });

    expect(result.current.categories[0].name).toBe('New Category');
    expect(result.current.items[0].category_name).toBe('New Category');
  });

  it('clears error when clearError is called', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Test error'));

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('throws error when create item fails', async () => {
    const mockItems = [];
    const mockCategories = [{ id: 1, name: 'Food', checkout_limit: 3 }];

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: mockItems }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: mockCategories }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Invalid data' } }),
      });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newItem = {
      name: 'New Item',
      type: 'General',
      category_id: 1,
      description: 'Test',
      quantity: 10,
      threshold: 5,
      items_per_basket: null,
    };

    await expect(result.current.createItem(newItem)).rejects.toThrow('Invalid data');
  });
});
