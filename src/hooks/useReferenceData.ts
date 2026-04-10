import { useState, useEffect } from 'react';
import { Building, CategoryProps, User } from '../types/interfaces';
import { getBuildings } from '../services/residentService';
import { getUsers } from '../services/userService';
import { getCategorizedItems } from '../services/itemsService';
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

    async function fetchCategorizedItems() {
      try {
        const response = await getCategorizedItems(user);
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
          fetchCategorizedItems(),
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
