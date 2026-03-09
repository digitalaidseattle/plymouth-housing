import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { ClientPrincipal } from '../types/interfaces';
import { getRole } from '../utils/userUtils';
import { getErrorMessage } from '../utils/apiUtils';

export async function getAuthMe(): Promise<{ clientPrincipal: ClientPrincipal | null }> {
  try {
    const response = await fetch('/.auth/me');
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching auth me:', error);
    throw error;
  }
}

export async function verifyPin(
  user: ClientPrincipal | null,
  volunteerId: number,
  enteredPin: string,
): Promise<{ value: Array<{ IsValid: boolean; ErrorMessage?: string }> }> {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  try {
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
      const message = await getErrorMessage(response);
      const err = new Error(message) as Error & { status: number };
      err.status = response.status;
      throw err;
    }

    return response.json();
  } catch (error) {
    console.error('Error verifying PIN:', error);
    throw error;
  }
}
