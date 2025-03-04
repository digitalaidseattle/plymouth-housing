import { getRole } from '../contexts/UserContext';
import { CheckoutItemProp, ClientPrincipal } from '../../types/interfaces';
import { ENDPOINTS, HEADERS } from '../../types/constants';

export async function processWelcomeBasket(user: ClientPrincipal | null, loggedInUserId: number, checkoutItems: CheckoutItemProp[], buildingCode: string) {
  HEADERS['X-MS-API-ROLE'] = getRole(user);
  const response = await fetch(ENDPOINTS.CHECKOUT_WELCOME_BASKET, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      user_id: loggedInUserId,
      mattress_size: checkoutItems[0].id,
      quantity: checkoutItems[0].quantity,
      building_code: buildingCode,
      message: "",
    }),
  });
  return await response.json();
}

export async function processGeneralItems(user: ClientPrincipal | null, loggedInUserId: number, checkoutItems: CheckoutItemProp[], buildingCode: string) {
  HEADERS['X-MS-API-ROLE'] = getRole(user);
  const response = await fetch(ENDPOINTS.CHECKOUT_GENERAL_ITEMS, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      user_id: loggedInUserId,
      items: checkoutItems.map((item) => ({ id: item.id, quantity: item.quantity })),
      building_code: buildingCode,
      message: "",
    }),
  });
  return await response.json();
}

export async function getRecentTransactions(buildingCode: string, unitNumber: string, itemId: number, months: number) {
  const response = await fetch(ENDPOINTS.RECENT_TRANSACTIONS, {
    method: 'GET',
    headers: HEADERS,
    body: JSON.stringify({
      building_code: buildingCode,
      unit_number: unitNumber,
      item_id: itemId,
      months: months,
    })
  });
  return await response.json();
}