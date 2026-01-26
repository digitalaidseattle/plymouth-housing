import { renderHook } from '@testing-library/react';
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
});
