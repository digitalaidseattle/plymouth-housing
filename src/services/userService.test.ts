import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getUsers, getUsersByFilter, createUser, updateUser } from './userService';
import { ENDPOINTS } from '../types/constants';
import { getRole } from '../utils/userUtils';
import { apiRequest } from './apiRequest';

vi.mock('../utils/userUtils', () => ({
  getRole: vi.fn(),
}));

vi.mock('./apiRequest', () => ({
  apiRequest: vi.fn(),
}));

describe('userService', () => {
  const user = { userDetails: 'testuser' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getRole as Mock).mockReturnValue('admin');
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [{ id: 1, name: 'Alice' }];
      (apiRequest as Mock).mockResolvedValue({
        value: mockUsers,
      });

      const result = await getUsers(user);

      expect(apiRequest).toHaveBeenCalledWith({
        url: ENDPOINTS.USERS,
        role: 'admin',
      });
      expect(result).toEqual(mockUsers);
    });

    it('should throw an error if the request fails', async () => {
      const error = new Error('Failed to fetch data: Unauthorized') as Error & { status: number };
      error.status = 401;
      (apiRequest as Mock).mockRejectedValue(error);

      await expect(getUsers(user)).rejects.toThrow('Failed to fetch data: Unauthorized');
    });
  });

  describe('getUsersByFilter', () => {
    const filter = "is_active eq true";

    it('should fetch users with filter successfully', async () => {
      const mockUsers = [{ id: 1, name: 'Alice' }];
      (apiRequest as Mock).mockResolvedValue({
        value: mockUsers,
      });

      const result = await getUsersByFilter(user, filter);

      expect(apiRequest).toHaveBeenCalledWith({
        url: `${ENDPOINTS.USERS}?$filter=${encodeURIComponent(filter)}`,
        role: 'admin',
      });
      expect(result).toEqual(mockUsers);
    });

    it('should throw an error if the request fails', async () => {
      const error = new Error('Failed to fetch data: Bad Request') as Error & { status: number };
      error.status = 400;
      (apiRequest as Mock).mockRejectedValue(error);

      await expect(getUsersByFilter(user, filter)).rejects.toThrow('Failed to fetch data: Bad Request');
    });
  });

  describe('createUser', () => {
    const newUserData = { name: 'Bob', pin: '1234' };

    it('should create a user and return from value array', async () => {
      const createdUser = { id: 2, name: 'Bob' };
      (apiRequest as Mock).mockResolvedValue({
        value: [createdUser],
      });

      const result = await createUser(user, newUserData);

      expect(apiRequest).toHaveBeenCalledWith({
        url: ENDPOINTS.USERS,
        role: 'admin',
        method: 'POST',
        body: newUserData,
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw an error if value array has unexpected length', async () => {
      (apiRequest as Mock).mockResolvedValue({
        value: [],
      });

      await expect(createUser(user, newUserData)).rejects.toThrow('expected exactly one user to be created');
    });

    it('should throw an error if the request fails', async () => {
      const error = new Error('Failed to fetch data: Bad Request') as Error & { status: number };
      error.status = 400;
      (apiRequest as Mock).mockRejectedValue(error);

      await expect(createUser(user, newUserData)).rejects.toThrow('Failed to fetch data: Bad Request');
    });
  });

  describe('updateUser', () => {
    const userId = 1;
    const updateData = { name: 'Alice Updated' };

    it('should update a user successfully', async () => {
      (apiRequest as Mock).mockResolvedValue({
        value: {},
      });

      await updateUser(user, userId, updateData);

      expect(apiRequest).toHaveBeenCalledWith({
        url: `${ENDPOINTS.USERS}/id/${userId}`,
        role: 'admin',
        method: 'PATCH',
        body: updateData,
      });
    });

    it('should throw an error if the request fails', async () => {
      const error = new Error('Failed to fetch data: Not Found') as Error & { status: number };
      error.status = 404;
      (apiRequest as Mock).mockRejectedValue(error);

      await expect(updateUser(user, userId, updateData)).rejects.toThrow('Failed to fetch data: Not Found');
    });
  });
});
