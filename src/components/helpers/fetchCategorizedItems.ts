import { API_HEADERS, ENDPOINTS } from '../../types/constants';

export default async function fetchCategorizedItems(userRole: string) {
  try {
    let categorizedItems;
    const cachedCategorizedItems = sessionStorage.getItem('categorizedItems');
    if (cachedCategorizedItems) {
      categorizedItems = JSON.parse(cachedCategorizedItems);
    } else {
      const headers = { ...API_HEADERS, 'X-MS-API-ROLE': userRole };
      const response = await fetch(ENDPOINTS.CATEGORIZED_ITEMS, {
        headers: headers,
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const responseData = await response.json();
      categorizedItems = responseData.value;
      sessionStorage.setItem(
        'categorizedItems',
        JSON.stringify(categorizedItems),
      );
    }
    return categorizedItems;
  } catch (error) {
    console.error('There was an error fetching categorized items', error);
  }
}
