import { API_HEADERS, SETTINGS } from '../types/constants';

interface ApiResponse<T> {
  value: T;
}

interface ApiConfig {
  url: string;
  role: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: object;
}

// Global callbacks that can be set by SpinUpContext
let globalSetShowSpinUpDialog: ((show: boolean) => void) | null = null;
let globalSetRetryCount: ((count: number) => void) | null = null;

export const setSpinUpCallbacks = (
  setShowDialog: (show: boolean) => void,
  setRetryCount: (count: number) => void
) => {
  globalSetShowSpinUpDialog = setShowDialog;
  globalSetRetryCount = setRetryCount;
};

const apiAttempt = async <T>(
  { url, role, method = 'GET', body }: ApiConfig,
  attempt: number = 1
): Promise<ApiResponse<T>> => {
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

    // Handle no-content responses (204, 205) - don't try to parse JSON
    if (response.status === 204 || response.status === 205) {
      return { value: null as unknown as T };
    }

    return response.json();
  } catch (error) {
    // Only retry on network errors or 5xx server errors (like DB spin-up)
    // Don't retry on 4xx client errors (auth, bad request, etc.)
    const shouldRetry =
      !(error instanceof Error && 'status' in error) || // Network error (no status)
      ((error as Error & { status: number }).status >= 500); // Server error

    if (shouldRetry && attempt < SETTINGS.database_retry_attempts) {
      globalSetShowSpinUpDialog?.(true);
      globalSetRetryCount?.(attempt);
      await new Promise(resolve => setTimeout(resolve, SETTINGS.database_retry_delay));
      return apiAttempt<T>({ url, role, method, body }, attempt + 1);
    }
    throw error;
  }
};

export const apiRequest = async <T>(config: ApiConfig): Promise<ApiResponse<T>> => {
  const slowTimer = setTimeout(() => {
    globalSetShowSpinUpDialog?.(true);
    globalSetRetryCount?.(0);
  }, SETTINGS.slow_request_threshold);

  try {
    const result = await apiAttempt<T>(config);
    globalSetShowSpinUpDialog?.(false);
    return result;
  } finally {
    clearTimeout(slowTimer);
  }
};
