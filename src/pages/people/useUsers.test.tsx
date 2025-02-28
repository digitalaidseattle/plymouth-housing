import { renderHook, act, waitFor } from '@testing-library/react';
import useUsers from './useUsers';
import { UserContext } from '../../components/contexts/UserContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Dummy user for context.
const dummyUser = {
  userID: "1",
  userDetails: "Test User",
  userRoles: ["volunteer"],
  claims: []
};

// Wrapper component to provide the UserContext.
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserContext.Provider
    value={{
      user: dummyUser,
      setUser: vi.fn(),
      loggedInUserId: 1,
      setLoggedInUserId: vi.fn(),
      activeVolunteers: [],
      setActiveVolunteers: vi.fn(),
    }}
  >
    {children}
  </UserContext.Provider>
);

describe('useUsers hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches users successfully on mount', async () => {
    const mockUsers = [
      { id: 1, name: 'User One', active: true },
      { id: 2, name: 'User Two', active: false },
    ];
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ value: mockUsers }),
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUsers(), { wrapper });
    await waitFor(() => result.current.loading === false);

    expect(result.current.originalData).toEqual(mockUsers);
    expect(result.current.filteredData).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    const errorMessage = 'Network error';
    global.fetch = vi.fn().mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useUsers(), { wrapper });
    await waitFor(() => result.current.loading === false);

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.originalData).toEqual([]);
  });

  it('updateUserStatus toggles active status successfully', async () => {
    const initialUsers = [
      { id: 1, name: 'User One', active: true },
      { id: 2, name: 'User Two', active: false },
    ];
    // First fetch returns initialUsers.
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ value: initialUsers }),
      })
      // PATCH request succeeds.
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

    const { result } = renderHook(() => useUsers(), { wrapper });
    await waitFor(() => result.current.loading === false);

    await act(async () => {
      await result.current.updateUserStatus(1);
    });

    const updatedUser = result.current.originalData.find(u => u.id === 1);
    expect(updatedUser?.active).toBe(false);
    const filteredUser = result.current.filteredData.find(u => u.id === 1);
    expect(filteredUser?.active).toBe(false);
  });

  it('throws error if updateUserStatus is called for a non-existent user', async () => {
    const initialUsers = [
      { id: 1, name: 'User One', active: true },
    ];
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ value: initialUsers }),
    });

    const { result } = renderHook(() => useUsers(), { wrapper });
    await waitFor(() => result.current.loading === false);

    await expect(result.current.updateUserStatus(999)).rejects.toThrow('User not found');
  });

  it('throws error when PATCH request fails in updateUserStatus', async () => {
    const initialUsers = [
      { id: 1, name: 'User One', active: true },
    ];
    const errorMsg = 'Bad Request';
    // Initial fetch returns initialUsers.
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ value: initialUsers }),
      })
      // PATCH request returns non‑ok response.
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: { message: errorMsg } }),
      });

    const { result } = renderHook(() => useUsers(), { wrapper });
    await waitFor(() => result.current.loading === false);

    await expect(result.current.updateUserStatus(1)).rejects.toThrow(`Error updating user: ${errorMsg}`);
  });
});
