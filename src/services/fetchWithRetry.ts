import { API_HEADERS, SETTINGS } from '../types/constants';

interface FetchResponse<T> {
  value: T;
}

interface FetchConfig {
  url: string;
  role: string;
  setShowSpinUpDialog: (show: boolean) => void;
  setRetryCount: (count: number) => void;
}

const fetchAttempts = async <T>(
  { url, role, setShowSpinUpDialog, setRetryCount }: FetchConfig,
  attempt: number = 1
): Promise<FetchResponse<T>> => {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': role };
    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (attempt < SETTINGS.database_retry_attempts) {
      setShowSpinUpDialog(true);
      setRetryCount(attempt);
      await new Promise(resolve => setTimeout(resolve, SETTINGS.database_retry_delay));
      return fetchAttempts<T>({ url, role, setShowSpinUpDialog, setRetryCount }, attempt + 1);
    }
    throw error;
  }
};

export const fetchWithRetry = async <T>(config: FetchConfig): Promise<FetchResponse<T>> => {
  const slowTimer = setTimeout(() => {
    config.setShowSpinUpDialog(true);
    config.setRetryCount(0);
  }, SETTINGS.slow_request_threshold);

  try {
    const result = await fetchAttempts<T>(config);
    config.setShowSpinUpDialog(false);
    return result;
  } finally {
    clearTimeout(slowTimer);
  }
};
