import { useState, useEffect, useContext, useCallback } from 'react';
import { User } from '../../types/interfaces';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS, HEADERS } from '../../types/constants';

const useUsers = () => {
  const {user} = useContext(UserContext);
  const [originalData, setOriginalData] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(
        `${ENDPOINTS.USERS}?$filter=(role eq 'volunteer' and active eq true) or role eq 'admin'`,
        {
          headers: HEADERS,
          method: 'GET',
        },
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setOriginalData(data.value);
      setFilteredData(data.value);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users: ' + error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  const updateUserStatus = async (userId: number) => {
    try {
      const userToUpdate = originalData.find((v) => v.id === userId);
      if (!userToUpdate) throw new Error('User not found');

      const updatedStatus = !userToUpdate.active;

      const requestUrl = `${ENDPOINTS.USERS}/id/${userId}`;
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
        throw new Error(`Error updating user: ${errorMessage}`);
      }

      // Update the local data
      const updatedUser = { ...userToUpdate, active: updatedStatus };

      const updatedOriginalData = originalData.map((user) =>
        user.id === userId ? updatedUser : user,
      );

      setOriginalData(updatedOriginalData);
      setFilteredData(updatedOriginalData);
    } catch (error) {
      console.error('Error updating user:', error);
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
    updateUserStatus,
  };
};

export default useUsers;
