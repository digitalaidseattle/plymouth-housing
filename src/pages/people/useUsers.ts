/**
 *  useUsers.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useEffect, useContext, useCallback } from 'react';
import { User } from '../../types/interfaces';
import { UserContext } from '../../components/contexts/UserContext';
import { getUsers, updateUser } from '../../services/userService';

const useUsers = () => {
  const { user } = useContext(UserContext);
  const [originalData, setOriginalData] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const users = await getUsers(user);
      setOriginalData(users);
      setFilteredData(users);
    } catch (error) {
      setError('Could not get users. \r\n' + error);
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
      await updateUser(user, userId, { active: updatedStatus });

      const updatedUser = { ...userToUpdate, active: updatedStatus };
      const updatedOriginalData = originalData.map((u) =>
        u.id === userId ? updatedUser : u,
      );
      setOriginalData(updatedOriginalData);
      setFilteredData(updatedOriginalData);
    } catch (err: unknown) {
      console.error('Error updating user:', err);

      // Normalize unknown to string - prefer the full Error.toString() when available
      const originalText = err instanceof Error ? err.toString() : String(err);
      throw new Error(`Error updating user: ${originalText}`);
    }
  };

  const clearError = () => setError(null);

  return {
    originalData,
    filteredData,
    setFilteredData,
    loading,
    error,
    clearError,
    refetch: fetchData,
    updateUserStatus,
  };
};

export default useUsers;
