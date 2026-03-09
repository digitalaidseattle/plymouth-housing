import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { ClientPrincipal } from '../types/interfaces';
import { getRole } from '../utils/userUtils';

export async function getAuthMe(): Promise<{ clientPrincipal: ClientPrincipal | null }> {
  const response = await fetch('/.auth/me');
  return response.json();
}

export async function verifyPin(
  user: ClientPrincipal | null,
  volunteerId: number,
  enteredPin: string,
): Promise<{ value: Array<{ IsValid: boolean; ErrorMessage?: string }> }> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  const response = await fetch(ENDPOINTS.VERIFY_PIN, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      VolunteerId: volunteerId,
      EnteredPin: enteredPin,
      IsValid: null,
      ErrorMessage: '',
    }),
  });

  if (!response.ok) {
    const err = new Error(
      `Failed to verify PIN (HTTP ${response.status}: ${response.statusText})`,
    ) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  return response.json();
}
