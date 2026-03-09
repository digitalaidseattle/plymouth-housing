/**
 *  UserContext.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { createContext } from 'react';
import { UserContextType } from '../../types/interfaces';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loggedInUserId: null,
  setLoggedInUserId: () => {},
  activeVolunteers: [],
  setActiveVolunteers: () => {},
  isLoading: true,
});

