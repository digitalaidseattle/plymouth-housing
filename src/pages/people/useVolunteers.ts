import { useState, useEffect } from 'react';
import { Volunteer } from '../../types/interfaces';

const VOLUNTEERS_API = '/data-api/rest/volunteer';
const HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=utf-8',
};

const useVolunteers = () => {
  const [originalData, setOriginalData] = useState<Volunteer[]>([]);
  const [filteredData, setFilteredData] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(VOLUNTEERS_API, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setOriginalData(data.value);
      setFilteredData(data.value);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setError('Error fetching volunteers: ' + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    originalData,
    filteredData,
    setFilteredData,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useVolunteers;
