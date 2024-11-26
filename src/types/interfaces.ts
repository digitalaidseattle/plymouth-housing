import { IdTokenClaims } from '@azure/msal-common';

export type CheckoutItem = {
    id: string;
    name: string;
    quantity: number;
  }
  
export type Item = {
    id: string;
    name: string;
  }
  
export interface Volunteer {
  id: number;
  name: string;
}

export interface UserContextType {
  user: IdTokenClaims | null;
  setUser: (user: IdTokenClaims) => void;
}
