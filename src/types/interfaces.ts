export type CheckoutItem = {
  id: string;
  name: string;
  quantity: number;
};

export type CategoryProps = {
  id: number;
  category: string;
  items: CheckoutItem[];
};

export type CheckoutCardProps = {
  item: CheckoutItem;
  checkoutItems: CheckoutItem[];
  addItemToCart: (item: CheckoutItem, quantity: number) => void;
};

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

export type CategoryType = {
  id: number,
  name: string,
  check_limit: number,
};