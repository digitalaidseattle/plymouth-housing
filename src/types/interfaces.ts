export type CheckoutItem = {
    id: string;
    name: string;
    quantity: number;
  }

export type Item = {
    id: string;
    name: string;
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