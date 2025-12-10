import { renderHook, act, waitFor } from '@testing-library/react';
import { useCatalog } from './useCatalog';
import { UserContext } from '../../components/contexts/UserContext';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with loading state', () => {
    // Mock fetch to never resolve so loading stays true
    global.fetch = vi.fn(() => new Promise(() => {})) as any;

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

    // Mock both fetch calls that happen in Promise.all
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ value: mockItems }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ value: mockCategories }),
      } as any);

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });

    expect(result.current.error).toBeNull();
    expect(result.current.items).toHaveLength(1);
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.items[0].category_name).toBe('Food');
  });

  it('handles fetch error', async () => {
    // Mock fetch to reject
    global.fetch = vi.fn().mockRejectedValue(new Error('Database is likely starting up. Try again in 30 seconds.')) as any;

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });

    expect(result.current.error).toContain('Database is likely starting up');
    expect(result.current.items).toEqual([]);
  });

  it('updates an item successfully', async () => {
    const mockItems = [
      { id: 1, name: 'Old Name', type: 'General', category_id: 1, description: 'Test', quantity: 10, threshold: 5, items_per_basket: null },
    ];
    const mockCategories = [{ id: 1, name: 'Food', checkout_limit: 3 }];

    global.fetch = vi.fn()
      // Initial fetch (items and categories)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ value: mockItems }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ value: mockCategories }),
      } as any)
      // Update item
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any);

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });

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
      // Initial fetch
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ value: mockItems }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ value: mockCategories }),
      } as any)
      // Update category
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any);

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });

    await act(async () => {
      await result.current.updateCategory(1, { name: 'New Category' });
    });

    expect(result.current.categories[0].name).toBe('New Category');
    expect(result.current.items[0].category_name).toBe('New Category');
  });

  it('clears error when clearError is called', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Test error')) as any;

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('throws error when create item fails', async () => {
    const mockItems: any[] = [];
    const mockCategories = [{ id: 1, name: 'Food', checkout_limit: 3 }];

    global.fetch = vi.fn()
      // Initial fetch
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ value: mockItems }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ value: mockCategories }),
      } as any)
      // Create item fails
      .mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: { message: 'Invalid data' } }),
      } as any);

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });

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
