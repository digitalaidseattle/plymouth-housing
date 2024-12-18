/**
 *  UserContext.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { createContext } from 'react';
import { IdTokenClaims } from '@azure/msal-common';
import { UserContextType } from '../../types/interfaces';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loggedInVolunteer: null,
  setLoggedInVolunteer: () => {},
  activeVolunteers: [],
  setActiveVolunteers: () => {},
});

export function getRole(user: IdTokenClaims | null): string {
  if (user?.roles?.includes('volunteer')) {
    return 'volunteer';
  }

  if (user?.roles?.includes('admin')) {
    return 'admin';
  }
  throw new Error('User is not a member of Admin or Volunteer role.');
}
