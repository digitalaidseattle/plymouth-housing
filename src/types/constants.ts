export const VITE_APPLICATION_NAME = 'Plymouth Housing';

export const API_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=utf-8',
  'X-MS-API-ROLE': '',
};

// Microsoft Static Web Apps behave differently when running locally versus when deployed.
// Locally, SWA intercepts calls to /data-api and forwards them to the backend API on localhost:5000
// When deployed, the call should go to /api, which SWA will route to the backend API.
const isLocal = import.meta.env.DEV;
const API_PREFIX = isLocal ? '/data-api/api' : '/api';

export const ENDPOINTS = {
  //tables
  USERS: API_PREFIX + '/users',
  ITEMS: API_PREFIX + '/items',
  CATEGORY: API_PREFIX + '/categories',
  BUILDINGS: API_PREFIX + '/building',
  UNITS: API_PREFIX + '/units',
  RESIDENTS: API_PREFIX + '/residents',
  //Stored Procedures
  VERIFY_PIN: API_PREFIX + '/verify-pin',
  CHECKOUT_GENERAL_ITEMS: API_PREFIX + '/checkout-general-items',
  CHECKOUT_WELCOME_BASKET: API_PREFIX + '/checkout-welcome-basket',
  PROCESS_INVENTORY_CHANGE: API_PREFIX + '/process-inventory-change',
  CHECK_PAST_CHECKOUT: API_PREFIX + '/check-past-checkout',
  PROCESS_INVENTORY_RESET_QUANTITY:
    API_PREFIX + '/process-inventory-reset-quantity',
  GET_LAST_RESIDENT_VISIT: API_PREFIX + '/get-last-resident-visit',
  //Views
  EXPANDED_ITEMS: API_PREFIX + '/itemswithcategory',
  CATEGORIZED_ITEMS: API_PREFIX + '/itemsbycategory',
} as const;

export const SETTINGS = {
  itemsPerPage: 10,
  database_retry_attempts: 20,
  database_retry_delay: 5000,
  inactivity_timeout: 15 * 60 * 1000, // 15 minutes in milliseconds
};

export const USER_ROLES = {
  ADMIN: 'admin',
  VOLUNTEER: 'volunteer',
} as const;

export const ROLE_PAGES = {
  admin: ['inventory', 'checkout', 'checkout-general', 'checkout-welcome-basket', 'people', 'catalog'],
  volunteer: ['volunteer-home', 'inventory', 'checkout', 'checkout-general', 'checkout-welcome-basket'],
} as const;
