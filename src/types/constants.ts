export const API_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=utf-8',
    'X-MS-API-ROLE': ''
  };

export const ENDPOINTS = {
  //tables
  USERS: '/api/users',
  ITEMS: '/api/items',
  CATEGORY: '/api/categories',
  BUILDINGS: '/api/building',
  UNITS: '/api/units',
  RESIDENTS: '/api/residents',
  //Stored Procedures
  VERIFY_PIN: '/api/verify-pin',
  CHECKOUT_GENERAL_ITEMS: '/api/checkout-general-items',
  CHECKOUT_WELCOME_BASKET: '/api/checkout-welcome-basket',
  PROCESS_INVENTORY_CHANGE: '/api/process-inventory-change',
  RECENT_TRANSACTIONS: '/api/recent-transactions',
  CHECK_PAST_CHECKOUT: '/api/check-past-checkout',
  //Views
  EXPANDED_ITEMS: '/api/itemswithcategory',
  CATEGORIZED_ITEMS: '/api/itemsbycategory',
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