/**
 *  UserContext.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { createContext } from 'react';
import { UserContextType, ClientPrincipal } from '../../types/interfaces';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loggedInUserId: null,
  setLoggedInUserId: () => {},
  activeVolunteers: [],
  setActiveVolunteers: () => {},
});

export function getRole(user: ClientPrincipal | null): string {
  if (user?.userRoles?.includes('volunteer')) {
    return 'volunteer';
  }

  if (user?.userRoles?.includes('admin')) {
    return 'admin';
  }
  
  throw new Error(`${user} - User is not a member of Admin or Volunteer role.`);
}

