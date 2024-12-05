/**
 *  UserContext.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { IdTokenClaims } from '@azure/msal-common';
import { createContext } from 'react';
import { VolunteerIdName } from '../../types/interfaces';

interface UserContextType {
  user: IdTokenClaims | null;
  setUser: (user: IdTokenClaims) => void;
  loginedVolunteer: VolunteerIdName| null;
  setLoginedVolunteer: (loginedVolunteerName: VolunteerIdName | null) => void;
  activatedVolunteers: VolunteerIdName[];
  setActivatedVolunteers: (activateVolunteer: VolunteerIdName[]) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loginedVolunteer: null, 
  setLoginedVolunteer: () => {},
  activatedVolunteers: [],
  setActivatedVolunteers: () => {},
});
