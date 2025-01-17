import { getRole } from '../contexts/UserContext';
import { CheckoutItem, ClientPrincipal } from '../../types/interfaces';
import { ENDPOINTS, HEADERS } from '../../types/constants';

export async function processWelcomeBasket(user: ClientPrincipal | null, currentUserId: number, checkoutItems: CheckoutItem[]) {
  HEADERS['X-MS-API-ROLE'] = getRole(user);
  const response = await fetch(ENDPOINTS.CHECKOUT_WELCOME_BASKET, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      user_id: currentUserId,
      mattress_size: checkoutItems[0].id,
      quantity: checkoutItems[0].quantity,
      message: "",
    }),
  });
  return await response.json();
}

export async function processGeneralItems(user: ClientPrincipal | null, currentUserId: number, checkoutItems: CheckoutItem[]) {
  HEADERS['X-MS-API-ROLE'] = getRole(user);
  const response = await fetch(ENDPOINTS.CHECKOUT_GENERAL_ITEMS, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      user_id: currentUserId,
      items: checkoutItems.map((item) => ({ id: item.id, quantity: item.quantity })),
      message: "",
    }),
  });
  return await response.json();
}