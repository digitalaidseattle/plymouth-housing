import { API_HEADERS, SETTINGS } from '../types/constants';

interface FetchResponse<T> {
  value: T;
}

interface FetchConfig {
  url: string;
  role: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: object;
  setShowSpinUpDialog?: (show: boolean) => void;
  setRetryCount?: (count: number) => void;
}

const fetchAttempts = async <T>(
  { url, role, method = 'GET', body, setShowSpinUpDialog, setRetryCount }: FetchConfig,
  attempt: number = 1
): Promise<FetchResponse<T>> => {
  try {
    const headers = { ...API_HEADERS, 'X-MS-API-ROLE': role };
    const options: RequestInit = { method, headers };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = new Error(`Failed to fetch data: ${response.statusText}`) as Error & { status: number };
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    // Only retry on network errors or 5xx server errors (like DB spin-up)
    // Don't retry on 4xx client errors (auth, bad request, etc.)
    const shouldRetry =
      !(error instanceof Error && 'status' in error) || // Network error (no status)
      ((error as Error & { status: number }).status >= 500); // Server error

    if (shouldRetry && attempt < SETTINGS.database_retry_attempts) {
      setShowSpinUpDialog?.(true);
      setRetryCount?.(attempt);
      await new Promise(resolve => setTimeout(resolve, SETTINGS.database_retry_delay));
      return fetchAttempts<T>({ url, role, method, body, setShowSpinUpDialog, setRetryCount }, attempt + 1);
    }
    throw error;
  }
};

export const fetchWithRetry = async <T>(config: FetchConfig): Promise<FetchResponse<T>> => {
  const slowTimer = setTimeout(() => {
    config.setShowSpinUpDialog?.(true);
    config.setRetryCount?.(0);
  }, SETTINGS.slow_request_threshold);

  try {
    const result = await fetchAttempts<T>(config);
    config.setShowSpinUpDialog?.(false);
    return result;
  } finally {
    clearTimeout(slowTimer);
  }
};
