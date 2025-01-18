<<<<<<< HEAD
import { IdTokenClaims } from '@azure/msal-common';

export type CheckoutItemProp = {
=======
export type CheckoutItem = {
>>>>>>> 53051c1a4d8648cb20f3bd5ec52ad4f81973ed7f
  id: number;
  name: string;
  quantity: number;
};

export type CategoryProps = {
  id: number;
  category: string;
  items: CheckoutItemProp[];
  checkout_limit: number;
  categoryCount?: number;
};

export type CheckoutCardProps = {
  item: CheckoutItemProp;
  checkoutItem: CategoryProps;
  addItemToCart: (item: CheckoutItemProp, quantity: number, category: string) => void;
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  removeButton: boolean;
  disableAdd: boolean;
  categoryLimit: number;
  categoryName: string,
};

export interface ClientPrincipal{
  userDetails: string,
  userID: string,
  userRoles: string[]
}

export interface UserContextType {
  user: ClientPrincipal | null;
  setUser: (user: ClientPrincipal) => void;
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

export type Building = {
  id: number;
  name: string;
  code: string;
};

export type ShoppingCart = {
  user_id: string;
  items: CheckoutItemProp[];
}