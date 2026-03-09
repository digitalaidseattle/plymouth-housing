import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { ClientPrincipal, User } from '../types/interfaces';
import { getRole } from '../utils/userUtils';

export async function getUsers(user: ClientPrincipal | null): Promise<User[]> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.USERS, { headers, method: 'GET' });
  if (!response.ok) throw new Error(response.statusText);
  const data = await response.json();
  return data.value;
}

export async function getUsersByFilter(
  user: ClientPrincipal | null,
  filter: string,
): Promise<User[]> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(`${ENDPOINTS.USERS}?$filter=${filter}`, {
    headers,
    method: 'GET',
  });
  if (!response.ok) throw new Error(response.statusText);
  const data = await response.json();
  return data.value;
}

export async function createUser(
  user: ClientPrincipal | null,
  data: object,
): Promise<User> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.USERS, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: { message?: string } }).error?.message ||
        response.statusText,
    );
  }
  const result = await response.json();
  return result.value ? result.value[0] : result;
}

export async function updateUser(
  user: ClientPrincipal | null,
  id: number,
  data: object,
): Promise<void> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(`${ENDPOINTS.USERS}/id/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: { message?: string } }).error?.message ||
        response.statusText,
    );
  }
}
