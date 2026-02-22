export enum TransactionType {
  Checkout = 1,
  InventoryAdd = 2,
  InventoryReplaceValue = 3,
}

export type CheckoutTransaction = {
  building_id: number;
  item_type: 'general' | 'welcome';
  resident_id: number;
  resident_name: string;
  total_quantity: number;
  transaction_date: string;
  transaction_id: string;
  unit_number: string;
  user_id: number;
  welcome_basket_item_id: number | null;
  welcome_basket_quantity: number | null;
};

export type InventoryTransaction = {
  category_name: string;
  item_name: string;
  quantity: number;
  transaction_date: string;
  transaction_id: string;
  transaction_type:
    | TransactionType.InventoryAdd
    | TransactionType.InventoryReplaceValue;
  user_id: number;
};

export type TransactionsByUser<T> = {
  user_id: number;
  transactions: T[];
};
