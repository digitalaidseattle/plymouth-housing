import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getUsers, getUsersByFilter, createUser, updateUser } from './userService';
import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { getRole } from '../utils/userUtils';

vi.mock('../utils/userUtils', () => ({
  getRole: vi.fn(),
}));

global.fetch = vi.fn();

describe('userService', () => {
  const user = { userDetails: 'testuser' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getRole as Mock).mockReturnValue('admin');
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [{ id: 1, name: 'Alice' }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: mockUsers }),
      });

      const result = await getUsers(user);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.USERS, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'GET',
      });
      expect(result).toEqual(mockUsers);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getUsers(user)).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUsersByFilter', () => {
    const filter = "is_active eq true";

    it('should fetch users with filter successfully', async () => {
      const mockUsers = [{ id: 1, name: 'Alice' }];
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: mockUsers }),
      });

      const result = await getUsersByFilter(user, filter);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.USERS}?$filter=${encodeURIComponent(filter)}`, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'GET',
      });
      expect(result).toEqual(mockUsers);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getUsersByFilter(user, filter)).rejects.toThrow('Bad Request');
    });
  });

  describe('createUser', () => {
    const newUserData = { name: 'Bob', pin: '1234' };

    it('should create a user and return from value array when present', async () => {
      const createdUser = { id: 2, name: 'Bob' };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [createdUser] }),
      });

      const result = await createUser(user, newUserData);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.USERS, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify(newUserData),
      });
      expect(result).toEqual(createdUser);
    });

    it('should return the result directly when no value array', async () => {
      const createdUser = { id: 2, name: 'Bob' };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createdUser),
      });

      const result = await createUser(user, newUserData);

      expect(result).toEqual(createdUser);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(createUser(user, newUserData)).rejects.toThrow('Bad Request');
    });
  });

  describe('updateUser', () => {
    const userId = 1;
    const updateData = { name: 'Alice Updated' };

    it('should update a user successfully', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await updateUser(user, userId, updateData);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.USERS}/id/${userId}`, {
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

      await expect(updateUser(user, userId, updateData)).rejects.toThrow('Not Found');
    });
  });
});
