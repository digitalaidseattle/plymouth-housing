import { useState, useEffect, useContext } from 'react';
import { Volunteer } from '../../types/interfaces';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS, HEADERS } from '../../types/constants';

const useVolunteers = () => {
  const {user} = useContext(UserContext);
  const [originalData, setOriginalData] = useState<Volunteer[]>([]);
  const [filteredData, setFilteredData] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.VOLUNTEERS, {
        headers: HEADERS,
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      console.log('Fetched volunteers:', data.value);
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

  const updateVolunteerStatus = async (volunteerId: number) => {
    try {
      const volunteerToUpdate = originalData.find((v) => v.id === volunteerId);
      if (!volunteerToUpdate) throw new Error('Volunteer not found');

      const updatedStatus = !volunteerToUpdate.active;

      const requestUrl = `${ENDPOINTS.VOLUNTEERS}/id/${volunteerId}`;
      HEADERS['X-MS-API-ROLE'] = getRole(user);

      const response = await fetch(requestUrl, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ active: updatedStatus }),
      });

      if (!response.ok) {
        // Parse error details
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`Error updating volunteer: ${errorMessage}`);
      }

      // Update the local data
      const updatedVolunteer = { ...volunteerToUpdate, active: updatedStatus };

      const updatedOriginalData = originalData.map((volunteer) =>
        volunteer.id === volunteerId ? updatedVolunteer : volunteer,
      );

      setOriginalData(updatedOriginalData);
      setFilteredData(updatedOriginalData);
    } catch (error) {
      console.error('Error updating volunteer:', error);
      throw error;
    }
  };

  return {
    originalData,
    filteredData,
    setFilteredData,
    loading,
    error,
    refetch: fetchData,
    updateVolunteerStatus,
  };
};

export default useVolunteers;
