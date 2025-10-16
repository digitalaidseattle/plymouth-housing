import { getRole } from '../contexts/UserContext';
import {
  Building,
  CheckoutItemProp,
  ClientPrincipal,
  ResidentInfo,
} from '../../types/interfaces';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';

export async function processWelcomeBasket(newTransactionID: string, user: ClientPrincipal | null, loggedInUserId: number, checkoutItems: CheckoutItemProp[], residentInfo: ResidentInfo) {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  try {
    const response = await fetch(ENDPOINTS.CHECKOUT_WELCOME_BASKET, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        new_transaction_id: newTransactionID,
        user_id: loggedInUserId,
        mattress_size: checkoutItems[0].id,
        quantity: checkoutItems[0].quantity,
        resident_id: residentInfo.id,
        message: "",
      }),
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
      console.error('Error processing welcome basket:', error);
      throw error;
  }
}

export async function processGeneralItems(newTransactionID: string, user: ClientPrincipal | null, loggedInUserId: number, checkoutItems: CheckoutItemProp[], residentInfo: ResidentInfo) {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  try {
    const response = await fetch(ENDPOINTS.CHECKOUT_GENERAL_ITEMS, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        new_transaction_id: newTransactionID,
        user_id: loggedInUserId,
        items: checkoutItems.map((item) => ({ id: item.id, quantity: item.quantity, additional_notes: item.additional_notes })),
        resident_id: residentInfo.id,
        message: "",
      }),
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
      console.error('Error processing general items:', error);
      throw error;
  }
}

export async function getBuildings(user: ClientPrincipal | null) {
  try {
    const cachedBuildings = sessionStorage.getItem('buildings');
    if (cachedBuildings) {
      return JSON.parse(cachedBuildings);
    }

    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(ENDPOINTS.BUILDINGS, {
      headers: headers,
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error(
          'Database is likely starting up. Try again in 30 seconds.',
        );
      } else {
        throw new Error(response.statusText);
      }
    }

    const data = await response.json();
    data.value.sort((a: Building, b: Building) => a.code.localeCompare(b.code));
    
    sessionStorage.setItem('buildings', JSON.stringify(data.value));
    return data.value;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
}

export async function getUnitNumbers(user: ClientPrincipal | null, buildingId: number) {
  try {
    const cacheKey = `units_${buildingId}`;
    const cachedUnits = sessionStorage.getItem(cacheKey);
    if (cachedUnits) {
      return JSON.parse(cachedUnits);
    }

    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
    const response = await fetch(`${ENDPOINTS.UNITS}?$filter=building_id eq ${buildingId}&$first=1000`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error(
          'Database is likely starting up. Try again in 30 seconds.',
        );
      } else {
        throw new Error(response.statusText);
      }
    }

    const data = await response.json();
    sessionStorage.setItem(cacheKey, JSON.stringify(data.value));
    
    return data.value;
  } catch (error) {
    console.error('Error fetching unit numbers:', error);
    throw error;
  }
};

export async function getResidents(user: ClientPrincipal | null, unitId: number) {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  try {
    const response = await fetch(`${ENDPOINTS.RESIDENTS}?$filter=unit_id eq ${unitId}`, {
      method: 'GET',
      headers: headers,
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function findResident(user: ClientPrincipal | null, name: string, unitId: number) {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  try {
    const safeName = name.replace(/'/g, "''");
    const filter = encodeURIComponent(`name eq '${safeName}' and unit_id eq ${unitId}`);
    const response = await fetch(`${ENDPOINTS.RESIDENTS}?$filter=${filter}`, {
      method: 'GET',
      headers: headers,
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function addResident(user: ClientPrincipal | null, name: string, unitId: number) {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  try {
    const response = await fetch(`${ENDPOINTS.RESIDENTS}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        name: name,
        unit_id: unitId,
      }),
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error('Error adding a resident:', error);
    throw error;
  }
}

export async function checkPastCheckout(user: ClientPrincipal | null, residentId: number) {
  const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
  try {
    const response = await fetch(ENDPOINTS.CHECK_PAST_CHECKOUT, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        resident_id: residentId,
      }),
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error('Error checking for a past checkout:', error);
    throw error;
  }
}
