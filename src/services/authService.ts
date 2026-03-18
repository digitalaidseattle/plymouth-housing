import { ENDPOINTS } from '../types/constants';
import { ClientPrincipal } from '../types/interfaces';
import { getRole } from '../utils/userUtils';
import { getErrorMessage } from '../utils/apiUtils';
import { apiRequest } from './apiRequest';

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
  enteredPin: string
): Promise<{ value: Array<{ IsValid: boolean; ErrorMessage?: string }> }> {
  try {
    const result = await apiRequest<Array<{ IsValid: boolean; ErrorMessage?: string }>>({
      url: ENDPOINTS.VERIFY_PIN,
      role: getRole(user),
      method: 'POST',
      body: {
        VolunteerId: volunteerId,
        EnteredPin: enteredPin,
        IsValid: null,
        ErrorMessage: '',
      },
    });

    return result;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    // Status code is preserved by apiRequest
    throw error;
  }
}
