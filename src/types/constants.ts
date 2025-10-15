export const API_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=utf-8',
    'X-MS-API-ROLE': ''
  };

export const ENDPOINTS = {
  //tables
  USERS: '/data-api/api/users',
  ITEMS: '/data-api/api/items',
  CATEGORY: '/data-api/api/categories',
  BUILDINGS: '/data-api/api/building',
  UNITS: '/data-api/api/units',
  RESIDENTS: '/data-api/api/residents',
  //Stored Procedures
  VERIFY_PIN: '/data-api/api/verify-pin',
  CHECKOUT_GENERAL_ITEMS: '/data-api/api/checkout-general-items',
  CHECKOUT_WELCOME_BASKET: '/data-api/api/checkout-welcome-basket',
  PROCESS_INVENTORY_CHANGE: '/data-api/api/process-inventory-change',
  RECENT_TRANSACTIONS: '/data-api/api/recent-transactions',
  CHECK_PAST_CHECKOUT: '/data-api/api/check-past-checkout',
  //Views
  EXPANDED_ITEMS: '/data-api/api/itemswithcategory',
  CATEGORIZED_ITEMS: '/data-api/api/itemsbycategory',
} as const;

export const SETTINGS = {
  itemsPerPage: 10,
  database_retry_attempts: 20,
  database_retry_delay: 5000,
  inactivity_timeout: 15 * 60 * 1000 // 15 minutes in milliseconds
}

export const USER_ROLES = {
  ADMIN: 'admin',
  VOLUNTEER: 'volunteer'
} as const;

export const ROLE_PAGES = {
  'admin': ['inventory', 'checkout', 'people'],
  'volunteer': ['volunteer-home', 'inventory', 'checkout']
} as const;