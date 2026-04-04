import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { getAuthMe, verifyPin } from './authService';
import { API_HEADERS, ENDPOINTS } from '../types/constants';
import { getRole } from '../utils/userUtils';

vi.mock('../utils/userUtils', () => ({
  getRole: vi.fn(),
}));

global.fetch = vi.fn();

describe('authService', () => {
  const user = { userDetails: 'testuser' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getRole as Mock).mockReturnValue('volunteer');
  });

  describe('getAuthMe', () => {
    it('should return clientPrincipal on success', async () => {
      const mockPrincipal = { clientPrincipal: { userDetails: 'testuser', userRoles: ['volunteer'] } };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPrincipal),
      });

      const result = await getAuthMe();

      expect(fetch).toHaveBeenCalledWith('/.auth/me');
      expect(result).toEqual(mockPrincipal);
    });

    it('should return null clientPrincipal when not authenticated', async () => {
      const mockResponse = { clientPrincipal: null };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getAuthMe();

      expect(result.clientPrincipal).toBeNull();
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({ ok: false, statusText: 'Unauthorized', clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }) });

      await expect(getAuthMe()).rejects.toThrow('Unauthorized');
    });
  });

  describe('verifyPin', () => {
    const volunteerId = 42;
    const enteredPin = '1234';

    it('should verify PIN successfully', async () => {
      const mockResponse = { value: [{ IsValid: true }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await verifyPin(user, volunteerId, enteredPin);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.VERIFY_PIN, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'volunteer' },
        body: JSON.stringify({
          VolunteerId: volunteerId,
          EnteredPin: enteredPin,
          IsValid: null,
          ErrorMessage: '',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return IsValid false for wrong PIN', async () => {
      const mockResponse = { value: [{ IsValid: false, ErrorMessage: 'Invalid PIN' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await verifyPin(user, volunteerId, enteredPin);

      expect(result.value[0].IsValid).toBe(false);
    });

    it('should throw an error with status attached on HTTP failure', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      const err = await verifyPin(user, volunteerId, enteredPin).catch((e) => e);

      expect(err).toBeInstanceOf(Error);
      expect(err.status).toBe(403);
    });
  });
});
