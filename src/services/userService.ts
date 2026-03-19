import { ENDPOINTS } from '../types/constants';
import { ClientPrincipal, User } from '../types/interfaces';
import { getRole } from '../utils/userUtils';
import { apiRequest } from './apiRequest';

export async function getUsers(user: ClientPrincipal | null): Promise<User[]> {
  try {
    const result = await apiRequest<User[]>({
      url: ENDPOINTS.USERS,
      role: getRole(user),
    });
    return result.value;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUsersByFilter(
  user: ClientPrincipal | null,
  filter: string,
): Promise<User[]> {
  try {
    const result = await apiRequest<User[]>({
      url: `${ENDPOINTS.USERS}?$filter=${encodeURIComponent(filter)}`,
      role: getRole(user),
    });
    return result.value;
  } catch (error) {
    console.error('Error fetching users by filter:', error);
    throw error;
  }
}

export async function createUser(
  user: ClientPrincipal | null,
  data: object,
): Promise<User> {
  try {
    const result = await apiRequest<User[]>({
      url: ENDPOINTS.USERS,
      role: getRole(user),
      method: 'POST',
      body: data,
    });
    if (Array.isArray(result.value)) {
      if (result.value.length != 1) {
        throw new Error('Create user returned an error: expected exactly one user to be created');
      }
      return result.value[0] as User;
    }
    throw new Error('Create user returned an unexpected error.');

  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(
  user: ClientPrincipal | null,
  id: number,
  data: object,
): Promise<void> {
  try {
    await apiRequest({
      url: `${ENDPOINTS.USERS}/id/${id}`,
      role: getRole(user),
      method: 'PATCH',
      body: data,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}
