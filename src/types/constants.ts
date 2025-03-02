export const HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=utf-8',
    'X-MS-API-ROLE': ''
  };

export const ENDPOINTS = {
  //tables
  USERS: '/data-api/rest/users',
  ITEMS: '/data-api/rest/items',
  CATEGORY: '/data-api/rest/categories',
  BUILDINGS: '/data-api/rest/building',
  //Stored Procedures
  VERIFY_PIN: '/data-api/rest/verify-pin',
  CHECKOUT_GENERAL_ITEMS: '/data-api/rest/checkout-general-items',
  CHECKOUT_WELCOME_BASKET: '/data-api/rest/checkout-welcome-basket',
  //Views
  EXPANDED_ITEMS: '/data-api/rest/itemswithcategory',
  CATEGORIZED_ITEMS: '/data-api/rest/itemsbycategory',
};

export const SETTINGS = {
  itemsPerPage: 10,
  database_retry_attempts: 5,
  database_retry_delay: 20000,
  inactivity_timeout: 15 * 60 * 1000 // 15 minutes in milliseconds
}


