import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { ClientPrincipal, User } from '../types/interfaces';
import { getRole } from '../utils/userUtils';
import { getErrorMessage } from '../utils/apiUtils';

export async function getUsers(user: ClientPrincipal | null): Promise<User[]> {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.USERS, { headers, method: 'GET' });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.value;
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
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(`${ENDPOINTS.USERS}?$filter=${encodeURIComponent(filter)}`, {
      headers,
      method: 'GET',
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.value;
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
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.USERS, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    const result = await response.json();
    if (Array.isArray(result.value)) {
      if (result.value.length === 0) {
        throw new Error('Create user returned no records');
      }
      return result.value[0] as User;
    }
    return result as User;
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
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(`${ENDPOINTS.USERS}/id/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}
