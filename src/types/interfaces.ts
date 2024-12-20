import { IdTokenClaims } from '@azure/msal-common';

export type CheckoutItemProp = {
  id: number;
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
  removeItemFromCart: (itemId: number) => void;
  removeButton: boolean;
};

export interface UserContextType {
  user: IdTokenClaims | null;
  setUser: (user: IdTokenClaims) => void;
  loggedInVolunteer: Volunteer | null;
  setLoggedInVolunteer: (loggedInVolunteer: Volunteer | null) => void;
  activeVolunteers: Volunteer[];
  setActiveVolunteers: (activeVolunteers: Volunteer[]) => void;
}

export type InventoryItem = {
  id: number;
  name: string;
  type: string;
  description: string;
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
  active: boolean | null;
  created_at: string;
  last_signed_in: string | null;
  PIN: string | null;
};
