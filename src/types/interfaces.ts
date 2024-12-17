import { IdTokenClaims } from '@azure/msal-common';

export type CheckoutItemProp = {
  id: string;
  name: string;
  quantity: number;
};

export type CategoryProps = {
  id: number;
  category: string;
  items: CheckoutItemProp[];
};

export type CheckoutCardProps = {
  item: CheckoutItemProp;
  checkoutItems: CheckoutItemProp[];
  addItemToCart: (item: CheckoutItemProp, quantity: number) => void;
};
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
  description: string,
  quantity: number;
  category: string;
  status: string;
};

export type CategoryItem = {
  id: number;
  name: string;
  item_limit: number;
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


export type CategoryType = {
  id: number,
  name: string,
  check_limit: number,
};