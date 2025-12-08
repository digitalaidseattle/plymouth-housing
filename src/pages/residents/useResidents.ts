import { useState, useEffect, useContext, useCallback } from 'react';
import { ResidentWithUnit } from '../../types/interfaces';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';

const useResidents = () => {
  const { user } = useContext(UserContext);
  const [originalData, setOriginalData] = useState<ResidentWithUnit[]>([]);
  const [filteredData, setFilteredData] = useState<ResidentWithUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
      const response = await fetch(
        `${ENDPOINTS.RESIDENTS_WITH_UNITS}`,
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
      setOriginalData(data.value);
      setFilteredData(data.value);
    } catch (error) {
      setError('Could not get residents. \r\n' + error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  const clearError = () => setError(null);

  return {
    originalData,
    filteredData,
    setFilteredData,
    loading,
    error,
    clearError,
    refetch: fetchData,
  };
};

export default useResidents;
