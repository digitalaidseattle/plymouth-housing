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
