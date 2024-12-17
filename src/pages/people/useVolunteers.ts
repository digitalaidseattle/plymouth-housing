import { useState, useEffect } from 'react';
import { Volunteer } from '../../types/interfaces';

const VOLUNTEERS_API = '/data-api/rest/volunteers';
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
      const response = await fetch(VOLUNTEERS_API, {
        headers: HEADERS,
        method: 'GET',
      });
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

  const updateVolunteerStatus = async (volunteerId: number) => {
    try {
      const volunteerToUpdate = originalData.find((v) => v.id === volunteerId);
      if (!volunteerToUpdate) throw new Error('Volunteer not found');

      const updatedStatus = !volunteerToUpdate.active;

      // Construct the request URL
      const requestUrl = `${VOLUNTEERS_API}/id/${volunteerId}`;

      // Prepare the headers
      const headers = {
        ...HEADERS,
      };

      // Send the PATCH request
      const response = await fetch(requestUrl, {
        method: 'PATCH',
        headers: headers,
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
