/**
 *  UserContext.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { createContext } from 'react';
import { UserContextType, ClientPrincipal } from '../../types/interfaces';
import { ROLES } from '../../types/constants';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loggedInUserId: null,
  setLoggedInUserId: () => {},
  activeVolunteers: [],
  setActiveVolunteers: () => {},
});

export function getRole(user: ClientPrincipal | null): string {
  if (user?.userRoles?.includes(ROLES.VOLUNTEER)) {
    return ROLES.VOLUNTEER;
  }

  if (user?.userRoles?.includes(ROLES.ADMIN)) {
    return ROLES.ADMIN;
  }
  
  throw new Error(`${user} - User is not a member of Admin or Volunteer role.`);
}

