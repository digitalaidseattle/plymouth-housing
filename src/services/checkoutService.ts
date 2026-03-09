import { getRole } from '../utils/userUtils';
import { getErrorMessage } from '../utils/apiUtils';
import {
  Building,
  CheckoutItemProp,
  ClientPrincipal,
  ResidentInfo,
  Unit,
} from '../types/interfaces';
import { ENDPOINTS, API_HEADERS, SETTINGS } from '../types/constants';
import { cacheGet, cacheSet } from '../utils/sessionCache';

export async function processWelcomeBasket(
  newTransactionID: string,
  user: ClientPrincipal | null,
  loggedInUserId: number,
  sheetSetItem: CheckoutItemProp,
  residentInfo: ResidentInfo,
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.CHECKOUT_WELCOME_BASKET, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        new_transaction_id: newTransactionID,
        user_id: loggedInUserId,
        mattress_size: sheetSetItem.id,
        quantity: sheetSetItem.quantity,
        resident_id: residentInfo.id,
        message: '',
      }),
    });

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing welcome basket:', error);
    throw error;
  }
}

export async function processGeneralItems(
  newTransactionID: string,
  user: ClientPrincipal | null,
  loggedInUserId: number,
  checkoutItems: CheckoutItemProp[],
  residentInfo: ResidentInfo,
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.CHECKOUT_GENERAL_ITEMS, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        new_transaction_id: newTransactionID,
        user_id: loggedInUserId,
        items: checkoutItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          additional_notes: item.additional_notes,
        })),
        resident_id: residentInfo.id,
        message: '',
      }),
    });

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing general items:', error);
    throw error;
  }
}

export async function getBuildings(user: ClientPrincipal | null) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const cachedBuildings = cacheGet<Building[]>('buildings');
    if (cachedBuildings) {
      return cachedBuildings;
    }
    const response = await fetch(ENDPOINTS.BUILDINGS, {
      headers,
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error(
          'Database is likely starting up. Try again in 30 seconds.',
        );
      }
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    data.value.sort((a: Building, b: Building) => a.code.localeCompare(b.code));

    cacheSet('buildings', data.value);
    return data.value;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
}

export async function getUnitNumbers(
  user: ClientPrincipal | null,
  buildingId: number,
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const cacheKey = `units_${buildingId}`;
    const cachedUnits = cacheGet<Unit[]>(cacheKey);
    if (cachedUnits) {
      return cachedUnits;
    }
    const response = await fetch(
      `${ENDPOINTS.UNITS}?$filter=building_id eq ${buildingId}&$first=${SETTINGS.api_fetch_limit_units}`,
      {
        method: 'GET',
        headers,
      },
    );

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error(
          'Database is likely starting up. Try again in 30 seconds.',
        );
      }
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    cacheSet(cacheKey, data.value);

    return data.value;
  } catch (error) {
    console.error('Error fetching unit numbers:', error);
    throw error;
  }
}

export async function getResidents(
  user: ClientPrincipal | null,
  unitId: number,
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(
      `${ENDPOINTS.RESIDENTS}?$filter=unit_id eq ${unitId}`,
      {
        method: 'GET',
        headers,
      },
    );
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function findResident(
  user: ClientPrincipal | null,
  name: string,
  unitId: number,
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const safeName = name.replace(/'/g, "''");
    const filter = encodeURIComponent(
      `name eq '${safeName}' and unit_id eq ${unitId}`,
    );
    const response = await fetch(`${ENDPOINTS.RESIDENTS}?$filter=${filter}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function addResident(
  user: ClientPrincipal | null,
  name: string,
  unitId: number,
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(`${ENDPOINTS.RESIDENTS}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: name,
        unit_id: unitId,
      }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding a resident:', error);
    throw error;
  }
}

export async function checkPastCheckout(
  user: ClientPrincipal | null,
  residentId: number,
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.CHECK_PAST_CHECKOUT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        resident_id: residentId,
      }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking for a past checkout:', error);
    throw error;
  }
}

export async function getLastResidentVisit(
  user: ClientPrincipal | null,
  residentId: number,
) {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.GET_LAST_RESIDENT_VISIT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ resident_id: residentId }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching last resident visit:', error);
    throw error;
  }
}
