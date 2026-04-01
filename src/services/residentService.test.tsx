
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  getBuildings,
  getUnitNumbers,
  getResidents,
  findResident,
  addResident,
  getResidentsByBuilding,
  getAllResidents,
  getLastResidentVisit,
} from './residentService';
import { API_HEADERS, ENDPOINTS, SETTINGS } from '../types/constants';
import { getRole } from '../utils/userUtils';

vi.mock('../utils/userUtils', () => ({
  getRole: vi.fn(),
}));

global.fetch = vi.fn();

describe('residentService', () => {
  const user = { userDetails: 'testuser' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (getRole as Mock).mockReturnValue('admin');
  });

  describe('getBuildings', () => {
    it('should fetch buildings successfully', async () => {
      const mockBuildings = { value: [{ id: 1, code: 'A' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBuildings),
      });

      const result = await getBuildings(user);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.BUILDINGS, {
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        method: 'GET',
      });
      expect(result).toEqual(mockBuildings.value);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getBuildings(user)).rejects.toThrow('Error');
    });
  });

  describe('getUnitNumbers', () => {
    const buildingId = 1;

    it('should fetch unit numbers successfully', async () => {
      const mockUnits = { value: [{ id: 1, unit_number: '101' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUnits),
      });

      const result = await getUnitNumbers(user, buildingId);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.UNITS}?$filter=building_id eq ${buildingId}&$first=${SETTINGS.api_fetch_limit_units}`, {
        method: 'GET',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
      });
      expect(result).toEqual(mockUnits.value);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getUnitNumbers(user, buildingId)).rejects.toThrow('Error');
    });
  });

  describe('getResidents', () => {
    const unitId = 1;

    it('should fetch residents successfully', async () => {
      const mockResidents = { value: [{ id: 1, name: 'John Doe' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResidents),
      });

      const result = await getResidents(user, unitId);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.RESIDENTS}?$filter=unit_id eq ${unitId}`, {
        method: 'GET',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
      });
      expect(result).toEqual(mockResidents);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getResidents(user, unitId)).rejects.toThrow('Error');
    });
  });

  describe('findResident', () => {
    const unitId = 1;
    const name = "John's Doe";

    it('should find a resident successfully', async () => {
      const mockResident = { value: [{ id: 1, name: "John's Doe" }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResident),
      });

      const result = await findResident(user, name, unitId);
      const safeName = name.replace(/'/g, "''");
      const filter = encodeURIComponent(`name eq '${safeName}' and unit_id eq ${unitId}`);

      expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.RESIDENTS}?$filter=${filter}`, {
        method: 'GET',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
      });
      expect(result).toEqual(mockResident);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(findResident(user, name, unitId)).rejects.toThrow('Error');
    });
  });

  describe('addResident', () => {
    const unitId = 1;
    const name = 'Jane Doe';

    it('should add a resident successfully', async () => {
      const mockResponse = { id: 2, name: 'Jane Doe' };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await addResident(user, name, unitId);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.RESIDENTS, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({ name, unit_id: unitId }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(addResident(user, name, unitId)).rejects.toThrow('Error');
    });
  });

  describe('getResidentsByBuilding', () => {
    const buildingId = 2;

    it('should fetch residents filtered by building successfully', async () => {
      const mockResponse = {
        value: [{ id: 1, name: 'Jane', unit_id: 10, unit_number: '101', building_id: 2, building_name: 'B', building_code: 'B2' }],
      };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getResidentsByBuilding(user, buildingId);

      const expectedUrl = `${ENDPOINTS.RESIDENTS_BY_BUILDING}?$filter=building_id eq ${buildingId}&$orderby=unit_number`;
      expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({ method: 'GET' }));
      expect(result).toEqual(mockResponse.value);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getResidentsByBuilding(user, buildingId)).rejects.toThrow('Error');
    });
  });

  describe('getAllResidents', () => {
    it('should fetch all residents with a high limit', async () => {
      const mockResponse = { value: [{ id: 1, name: 'Jane', unit_id: 10, unit_number: '101', building_id: 2, building_name: 'B', building_code: 'B2' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getAllResidents(user);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('$first=10000'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(mockResponse.value);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getAllResidents(user)).rejects.toThrow('Error');
    });
  });

  describe('getLastResidentVisit', () => {
    const residentId = 1;

    it('should fetch last resident visit successfully', async () => {
      const mockResponse = { value: [{ transaction_date: '2025-01-15T10:30:00' }] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getLastResidentVisit(user, residentId);

      expect(fetch).toHaveBeenCalledWith(ENDPOINTS.GET_LAST_RESIDENT_VISIT, {
        method: 'POST',
        headers: { ...API_HEADERS, 'X-MS-API-ROLE': 'admin' },
        body: JSON.stringify({ resident_id: residentId }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty result when resident has no visits', async () => {
      const mockResponse = { value: [] };
      (fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getLastResidentVisit(user, residentId);

      expect(result).toEqual(mockResponse);
      expect(result.value).toEqual([]);
    });

    it('should throw an error if the request fails', async () => {
      (fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Error',
        clone: () => ({ json: () => Promise.reject(new Error()), text: () => Promise.resolve('') }),
      });

      await expect(getLastResidentVisit(user, residentId)).rejects.toThrow('Error');
    });
  });
});
