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
  loggedInVolunteerId: null,
  setLoggedInVolunteerId: () => {},
  activeVolunteers: [],
  setActiveVolunteers: () => {},
  loggedInAdmin: null,
  setLoggedInAdmin: () => {},

});

export function getRole(user: ClientPrincipal | null): string {
  if (user?.userRoles?.includes('volunteer')) {
    return 'volunteer';
  }

  if (user?.userRoles?.includes('admin')) {
    return 'admin';
  }
  throw new Error('User is not a member of Admin or Volunteer role.');
}
