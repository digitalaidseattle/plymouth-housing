import { getRole } from '../utils/userUtils';
import { Building, ClientPrincipal, Unit } from '../types/interfaces';
import { ENDPOINTS, SETTINGS } from '../types/constants';
import { cacheGet, cacheSet } from '../utils/sessionCache';
import { apiRequest } from './apiRequest';

export async function getBuildings(user: ClientPrincipal | null) {
  try {
    const cachedBuildings = cacheGet<Building[]>('buildings');
    if (cachedBuildings) {
      return cachedBuildings;
    }

    const result = await apiRequest<Building[]>({
      url: ENDPOINTS.BUILDINGS,
      role: getRole(user),
    });

    result.value.sort((a: Building, b: Building) => a.code.localeCompare(b.code));

    cacheSet('buildings', result.value);
    return result.value;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
}

export async function getUnitNumbers(user: ClientPrincipal | null, buildingId: number) {
  try {
    const cacheKey = `units_${buildingId}`;
    const cachedUnits = cacheGet<Unit[]>(cacheKey);
    if (cachedUnits) {
      return cachedUnits;
    }

    const result = await apiRequest<Unit[]>({
      url: `${ENDPOINTS.UNITS}?$filter=building_id eq ${buildingId}&$first=${SETTINGS.api_fetch_limit_units}`,
      role: getRole(user),
    });

    cacheSet(cacheKey, result.value);
    return result.value;
  } catch (error) {
    console.error('Error fetching unit numbers:', error);
    throw error;
  }
}

export async function getResidents(user: ClientPrincipal | null, unitId: number) {
  try {
    const result = await apiRequest<Array<{ id: number; name: string }>>({
      url: `${ENDPOINTS.RESIDENTS}?$filter=unit_id eq ${unitId}`,
      role: getRole(user),
    });
    return result;
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function findResident(user: ClientPrincipal | null, name: string, unitId: number) {
  try {
    const safeName = name.replace(/'/g, "''");
    const filter = encodeURIComponent(`name eq '${safeName}' and unit_id eq ${unitId}`);
    const result = await apiRequest<Array<{ id: number; name: string }>>({
      url: `${ENDPOINTS.RESIDENTS}?$filter=${filter}`,
      role: getRole(user),
    });
    return result;
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function addResident(user: ClientPrincipal | null, name: string, unitId: number) {
  try {
    const result = await apiRequest<Array<{ id: number; name: string }>>({
      url: ENDPOINTS.RESIDENTS,
      role: getRole(user),
      method: 'POST',
      body: { name, unit_id: unitId },
    });
    return result;
  } catch (error) {
    console.error('Error adding a resident:', error);
    throw error;
  }
}

export async function getResidentsByBuilding(user: ClientPrincipal | null, buildingId: number) {
  try {
    const result = await apiRequest<Array<{
      id: number;
      name: string;
      unit_id: number;
      unit_number: string;
      building_id: number;
      building_name: string;
      building_code: string;
    }>>({
      url: `${ENDPOINTS.RESIDENTS_BY_BUILDING}?$filter=building_id eq ${buildingId}&$orderby=unit_number`,
      role: getRole(user),
    });
    return result.value;
  } catch (error) {
    console.error('Error fetching residents by building:', error);
    throw error;
  }
}

export async function getAllResidents(user: ClientPrincipal | null) {
  try {
    const result = await apiRequest<Array<{
      id: number;
      name: string;
      unit_id: number;
      unit_number: string;
      building_id: number;
      building_name: string;
      building_code: string;
    }>>({
      url: `${ENDPOINTS.RESIDENTS_BY_BUILDING}?$first=10000`,
      role: getRole(user),
    });
    return result.value;
  } catch (error) {
    console.error('Error fetching all residents:', error);
    throw error;
  }
}

export async function getLastResidentVisit(user: ClientPrincipal | null, residentId: number) {
  try {
    const result = await apiRequest({
      url: ENDPOINTS.GET_LAST_RESIDENT_VISIT,
      role: getRole(user),
      method: 'POST',
      body: { resident_id: residentId },
    });
    return result;
  } catch (error) {
    console.error('Error fetching last resident visit:', error);
    throw error;
  }
}
