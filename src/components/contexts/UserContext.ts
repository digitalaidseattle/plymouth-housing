/**
 *  UserContext.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { IdTokenClaims } from '@azure/msal-common';
import { createContext } from 'react';

interface UserContextType {
  user: IdTokenClaims | null;
  setUser: (user: IdTokenClaims) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function getRole(user: IdTokenClaims | null): string{
  console.log(user?.roles);
  if (user?.roles?.includes('volunteer')) {
    return 'volunteer';
  }

  if (user?.roles?.includes('admin')) {
    return 'admin';
  }

  throw new Error('User is not a member of Admin or Volunteer role.');
};

