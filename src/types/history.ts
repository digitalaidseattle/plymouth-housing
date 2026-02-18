export enum TransactionType {
  Checkout = 1,
  InventoryAdd = 2,
  InventoryReplaceValue = 3,
}

export type TransactionItem = {
  category_name: string;
  item_id: number;
  item_name: string;
  quantity: number;
};

export type CheckoutTransaction = {
  building_id: number;
  item_type: 'general' | 'welcome';
  items: TransactionItem[];
  resident_id: number;
  resident_name: string;
  transaction_date: string;
  transaction_id: string;
  unit_number: string;
  user_id: number;
};

export type InventoryTransaction = {
  item_type: 'general' | 'welcome';
  items: TransactionItem[];
  transaction_date: string;
  transaction_id: string;
  transaction_type:
    | TransactionType.InventoryAdd
    | TransactionType.InventoryReplaceValue;
  user_id: number;
};

export type HistoryNavigationState = {
  fromHistory: true;
  transactionType: 'checkout' | 'inventory';
  checkoutType?: 'general' | 'welcomeBasket';

  checkoutData?: {
    original_transaction_id: string;
    residentInfo: {
      id: number;
      name: string;
      building_id: number;
      unit_number: string;
    };
    items: TransactionItem[];
    item_type: 'general' | 'welcome';
  };

  inventoryData?: {
    items: TransactionItem[];
    transaction_type: TransactionType;
    item_type: 'general' | 'welcome';
  };
};
