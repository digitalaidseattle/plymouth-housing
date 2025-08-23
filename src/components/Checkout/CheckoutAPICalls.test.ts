
import { processWelcomeBasket, processGeneralItems, getUnitNumbers, getResidents, findResident, addResident, checkPastCheckout } from './CheckoutAPICalls';
import { vi } from 'vitest';
import { API_HEADERS, ENDPOINTS } from '../../types/constants';

describe('CheckoutAPICalls', () => {
  const user = { userDetails: 'test', userID: 'test', userRoles: ['admin'] };
  const loggedInUserId = 1;
  const checkoutItems = [{ id: 1, name: 'Test Item', quantity: 1, description: '' }];
  const residentInfo = { id: 1, name: 'Test Resident', unit: { id: 1, unit_number: '1' }, building: { id: 1, name: 'Test Building', code: 'TB' } };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    ) as any;
  });

  it('should call fetch with the correct parameters for processWelcomeBasket', async () => {
    await processWelcomeBasket(user, loggedInUserId, checkoutItems, residentInfo);
    expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CHECKOUT_WELCOME_BASKET, {
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
  });

  it('should call fetch with the correct parameters for processGeneralItems', async () => {
    await processGeneralItems(user, loggedInUserId, checkoutItems, residentInfo);
    expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CHECKOUT_GENERAL_ITEMS, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({
        user_id: loggedInUserId,
        items: checkoutItems.map((item) => ({ id: item.id, quantity: item.quantity, additional_notes: item.additional_notes })),
        resident_id: residentInfo.id,
        message: "",
      }),
    });
  });

  it('should call fetch with the correct parameters for getUnitNumbers', async () => {
    await getUnitNumbers(1);
    expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.UNITS}?$filter=(building_id eq 1)`, {
      method: 'GET',
      headers: API_HEADERS,
    });
  });

  it('should call fetch with the correct parameters for getResidents', async () => {
    await getResidents(1);
    expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.RESIDENTS}?$filter=unit_id eq 1`, {
      method: 'GET',
      headers: API_HEADERS,
    });
  });

  it('should call fetch with the correct parameters for findResident', async () => {
    await findResident('Test Resident', 1);
    expect(fetch).toHaveBeenCalledWith(`${ENDPOINTS.RESIDENTS}?$filter=name eq 'Test Resident' and unit_id eq 1`, {
      method: 'GET',
      headers: API_HEADERS,
    });
  });

  it('should call fetch with the correct parameters for addResident', async () => {
    await addResident('Test Resident', 1);
    expect(fetch).toHaveBeenCalledWith(ENDPOINTS.RESIDENTS, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({
        name: 'Test Resident',
        unit_id: 1,
      }),
    });
  });

  it('should call fetch with the correct parameters for checkPastCheckout', async () => {
    await checkPastCheckout(1);
    expect(fetch).toHaveBeenCalledWith(ENDPOINTS.CHECK_PAST_CHECKOUT, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({
        resident_id: 1,
      }),
    });
  });
});
