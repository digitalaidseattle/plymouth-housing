import { getRole } from '../contexts/UserContext';
import { CheckoutItemProp, ClientPrincipal, ResidentInfo } from '../../types/interfaces';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';

export async function processWelcomeBasket(user: ClientPrincipal | null, loggedInUserId: number, checkoutItems: CheckoutItemProp[], residentInfo: ResidentInfo) {
  API_HEADERS['X-MS-API-ROLE'] = getRole(user);
  const response = await fetch(ENDPOINTS.CHECKOUT_WELCOME_BASKET, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify({
      user_id: loggedInUserId,
      mattress_size: checkoutItems[0].id,
      quantity: checkoutItems[0].quantity,
      resident_id: residentInfo.id,
      message: "",
    }),
  });
  return await response.json();
}

export async function processGeneralItems(user: ClientPrincipal | null, loggedInUserId: number, checkoutItems: CheckoutItemProp[], residentInfo: ResidentInfo) {
  API_HEADERS['X-MS-API-ROLE'] = getRole(user);
  const response = await fetch(ENDPOINTS.CHECKOUT_GENERAL_ITEMS, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify({
      user_id: loggedInUserId,
      items: checkoutItems.map((item) => ({ id: item.id, quantity: item.quantity, additional_notes: item.additional_notes })),
      resident_id: residentInfo.id,
      message: "",
    }),
  });
  return await response.json();
}


export async function getRecentTransactions(buildingCode: string, unitNumber: string, itemId: number, months: number) {
  const response = await fetch(ENDPOINTS.RECENT_TRANSACTIONS, {
    method: 'GET',
    headers: API_HEADERS,
    body: JSON.stringify({
      building_code: buildingCode,
      unit_number: unitNumber,
      item_id: itemId,
      months: months,
    })
  });
  return await response.json();
}

export async function getUnitNumbers(buildingId: number) {
  try {
    const response = await fetch(`${ENDPOINTS.UNITS}?$filter=(building_id eq ${buildingId})`, {
      method: 'GET',
      headers: API_HEADERS,
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function getResidents(unitId: number) {
  try {
    const response = await fetch(`${ENDPOINTS.RESIDENTS}?$filter=unit_id eq ${unitId}`, {
      method: 'GET',
      headers: API_HEADERS,
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function findResident(name: string, unitId: number) {
  try {
    const response = await fetch(`${ENDPOINTS.RESIDENTS}?$filter=name eq '${name}' and unit_id eq ${unitId}`, {
      method: 'GET',
      headers: API_HEADERS,
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function addResident(name: string, unitId: number) {
  try {
    const response = await fetch(`${ENDPOINTS.RESIDENTS}`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({
        name: name,
        unit_id: unitId,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding a resident:', error);
    throw error;
  }
}

export async function checkPastCheckout(residentId: number, itemId: number) {
  const response = await fetch(ENDPOINTS.CHECK_PAST_CHECKOUT, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify({
      resident_id: residentId,
      item_id: itemId
    }),
  });
  return await response.json();
}