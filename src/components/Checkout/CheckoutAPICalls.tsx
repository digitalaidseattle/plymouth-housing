import { getRole } from '../contexts/UserContext';
import { CheckoutItem, Volunteer } from '../../types/interfaces';
import { ENDPOINTS, HEADERS } from '../../types/constants';
import { TokenClaims } from '@azure/msal-common';

export async function processWelcomeBasket(user: TokenClaims | null, loggedInVolunteer: Volunteer, checkoutItems: CheckoutItem[]) {
  HEADERS['X-MS-API-ROLE'] = getRole(user);
  const response = await fetch(ENDPOINTS.CHECKOUT_WELCOME_BASKET, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      user_id: loggedInVolunteer?.id,
      mattress_size: checkoutItems[0].id,
      quantity: checkoutItems[0].quantity,
    }),
  });
  return await response.json();
}

export async function processGeneralItems(user: TokenClaims | null, loggedInVolunteer: Volunteer, checkoutItems: CheckoutItem[]) {
  HEADERS['X-MS-API-ROLE'] = getRole(user);
  const response = await fetch(ENDPOINTS.CHECKOUT_GENERAL_ITEMS, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      user_id: loggedInVolunteer?.id,
      items: checkoutItems.map((item) => ({ id: item.id, quantity: item.quantity })),
    }),
  });
  return await response.json();
}