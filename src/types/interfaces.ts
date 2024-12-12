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
  
export interface UserContextType {
  user: IdTokenClaims | null;
  setUser: (user: IdTokenClaims) => void;
}

export type InventoryItem = {
  id: number;
  name: string;
  type: string;
  quantity: number;
  category: string;
  description: string;
  status: string;
};

export type AddVolunteerModalProps = {
  addModal: boolean;
  handleAddClose: () => void;
  fetchData: () => void;
};

export type Volunteer = {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  last_signed_in: string | null;
  PIN: string;
};

export type Building = {
  id: number;
  name: string;
  code: string;
};
