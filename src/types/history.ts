export enum TransactionType {
  Checkout = 1,
  InventoryAdd = 2,
  InventoryReplaceValue = 3,
}

export type TransactionItem = {
  item_id: number;
  quantity: number;
};

export type BaseTransaction = {
  id: string;
  user_id: number;
  user_name: string;
  timestamp: string;
  transaction_type: TransactionType;
};

export type CheckoutItemResponse = BaseTransaction & {
  transaction_type: TransactionType.Checkout;
  building_id: number;
  unit_number: string;
  resident_name: string;
  item_id: number;
  quantity: number;
};

export type InventoryItemResponse = BaseTransaction & {
  transaction_type:
    | TransactionType.InventoryAdd
    | TransactionType.InventoryReplaceValue;
  item_id: number;
  quantity: number;
  item_name: string;
  category_name: string;
};

export type HistoryResponse = CheckoutItemResponse | InventoryItemResponse;

export type CheckoutTransaction = {
  id: string;
  resident_name: string;
  building_id: number;
  unit_number: string;
  items: TransactionItem[];
  timestamp: string;
};

export type InventoryTransaction = {
  id: string;
  transaction_type: TransactionType;
  item_id: number;
  item_name: string;
  category_name: string;
  quantity: number;
  timestamp: string;
};

export type TransactionsByUser<T> = {
  user_id: number;
  transactions: T[];
};
