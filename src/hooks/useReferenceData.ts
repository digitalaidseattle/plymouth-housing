import { useState, useEffect } from 'react';
import { Building, CategoryProps, User } from '../types/interfaces';
import { getBuildings } from '../services/CheckoutAPICalls';
import { getUsers } from '../components/History/HistoryAPICalls';
import fetchCategorizedItems from '../components/utils/fetchCategorizedItems';
import { getRole } from '../utils/userUtils';
import type { ClientPrincipal } from '../types/interfaces';

interface UseReferenceDataProps {
  user: ClientPrincipal | null;
  onError: (message: string) => void;
}

export function useReferenceData({ user, onError }: UseReferenceDataProps) {
  const [userList, setUserList] = useState<User[] | null>(null);
  const [buildings, setBuildings] = useState<Building[] | null>(null);
  const [categorizedItems, setCategorizedItems] = useState<CategoryProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUserList() {
      try {
        const response = await getUsers(user);
        setUserList(response);
      } catch (error) {
        onError('Error fetching users: ' + error);
      }
    }

    async function fetchBuildings() {
      try {
        const response = await getBuildings(user);
        setBuildings(response);
      } catch (error) {
        onError('Error fetching buildings: ' + error);
      }
    }

    async function getCategorizedItems() {
      try {
        const userRole = getRole(user);
        const response = await fetchCategorizedItems(userRole);
        setCategorizedItems(response);
      } catch (error) {
        onError('Error fetching item and category data: ' + error);
        setCategorizedItems([]);
      }
    }

    async function loadInitialData() {
      try {
        setIsLoading(true);
        await Promise.all([
          getUserList(),
          fetchBuildings(),
          getCategorizedItems(),
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [user, onError]);

  return {
    userList,
    buildings,
    categorizedItems,
    isLoading,
  };
}
