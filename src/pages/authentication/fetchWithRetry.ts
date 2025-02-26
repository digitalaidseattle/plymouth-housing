import { User, ClientPrincipal } from '../../types/interfaces';
import { ENDPOINTS, HEADERS, SETTINGS } from '../../types/constants';
import { getRole } from '../../components/contexts/UserContext';

interface VolunteersResponse {
  value: User[];
}

interface FetchConfig {
  user: ClientPrincipal | null;
  setShowSpinUpDialog: (show: boolean) => void;
  setRetryCount: (count: number) => void;
}

export const fetchWithRetry = async (
  { user, setShowSpinUpDialog, setRetryCount }: FetchConfig,
  attempt: number = 1
): Promise<VolunteersResponse> => {
  try {
    HEADERS['X-MS-API-ROLE'] = getRole(user);
    const response = await fetch(
      `${ENDPOINTS.USERS}?$select=id,name&$filter=active eq true and role eq 'volunteer'`,
      {
        method: 'GET',
        headers: HEADERS,
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch volunteers: ${response.statusText}`);
    }
    
    setShowSpinUpDialog(false);
    return response.json();
    
  } catch (error) {
    if (attempt < SETTINGS.database_retry_attempts) {
      setShowSpinUpDialog(true);
      setRetryCount(attempt);
      await new Promise(resolve => setTimeout(resolve, SETTINGS.database_retry_delay));
      return fetchWithRetry({ user, setShowSpinUpDialog, setRetryCount }, attempt + 1);
    }
    throw error;
  }
};