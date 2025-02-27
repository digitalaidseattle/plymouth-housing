import { HEADERS, SETTINGS } from '../types/constants';

interface FetchResponse<T> {
  value: T;
}

interface FetchConfig {
  url: string;
  role: string;
  setShowSpinUpDialog: (show: boolean) => void;
  setRetryCount: (count: number) => void;
}

export const fetchWithRetry = async <T>(
  { url, role, setShowSpinUpDialog, setRetryCount }: FetchConfig,
  attempt: number = 1
): Promise<FetchResponse<T>> => {
  try {
    HEADERS['X-MS-API-ROLE'] = role;
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: HEADERS,
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    setShowSpinUpDialog(false);
    return response.json();
    
  } catch (error) {
    if (attempt < SETTINGS.database_retry_attempts) {
      setShowSpinUpDialog(true);
      setRetryCount(attempt);
      await new Promise(resolve => setTimeout(resolve, SETTINGS.database_retry_delay));
      return fetchWithRetry<T>({ url, role, setShowSpinUpDialog, setRetryCount }, attempt + 1);
    }
    throw error;
  }
};