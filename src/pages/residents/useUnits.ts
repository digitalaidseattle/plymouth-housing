import { useState, useEffect, useContext, useCallback } from 'react';
import { Unit } from '../../types/interfaces';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';

const useUnits = () => {
  const { user } = useContext(UserContext);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
      const response = await fetch(
        `${ENDPOINTS.UNITS}`,
        {
          headers: headers,
          method: 'GET',
        },
      );
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Database is likely starting up. Try again in 30 seconds.');
        } else {
          throw new Error(response.statusText);
        }
      }
      const data = await response.json();
      setUnits(data.value);
    } catch (error) {
      setError('Could not get units. \r\n' + error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  const clearError = () => setError(null);

  return {
    units,
    loading,
    error,
    clearError,
    refetch: fetchData,
  };
};

export default useUnits;
