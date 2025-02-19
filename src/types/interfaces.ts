export type CheckoutItemProp = {
  id: number;
  name: string;
  quantity: number;
  description: string;
};

export type CategoryProps = {
  id: number;
  category: string;
  items: CheckoutItemProp[];
  checkout_limit: number;
  categoryCount: number;
};

export type CheckoutCardProps = {
  item: CheckoutItemProp;
  categoryCheckout: CategoryProps;
  addItemToCart: (item: CheckoutItemProp, quantity: number, category: string) => void;
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  removeButton: boolean;
  disableAdd?: boolean;
  categoryLimit: number;
  categoryName: string,
  activeSection?: string,
};

export interface ClientPrincipal{
  userDetails: string,
  userID: string,
  userRoles: string[]
}

export interface UserContextType {
  user: ClientPrincipal | null;
  setUser: (user: ClientPrincipal) => void;
  loggedInUserId: number | null;
  setLoggedInUserId: (loggedInVolunteer: number | null) => void;
  activeVolunteers: User[];
  setActiveVolunteers: (activeVolunteers: User[]) => void;
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

// BaseUser defines the common properties shared by all user types.
export type BaseUser = {
  id: number;
  name: string;
  active: boolean;
  created_at: string;
  last_signed_in: string| null;
  role: string;
};

// AdminUser extends BaseUser and represents an admin user.
export type AdminUser = BaseUser & {
  role: 'admin';
  PIN: null;
};

// VolunteerUser extends BaseUser and represents a volunteer user.
export type VolunteerUser = BaseUser & {
  role: 'volunteer';
  PIN: string;
};

// User is a union type that can be either an AdminUser or a VolunteerUser.
// Using a union type for User allows us to enforce different constraints
// This approach aim to provide compile-time safety and better code maintainability.
export type User = AdminUser | VolunteerUser;

export type Building = {
  id: number;
  name: string;
  code: string;
};

export type ShoppingCart = {
  user_id: string;
  items: CheckoutItemProp[];
}