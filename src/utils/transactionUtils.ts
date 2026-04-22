import { CheckoutItemProp, CheckoutTransaction, User } from '../types/interfaces';
import { Palette } from '@mui/material';

export const computeEffectiveItems = (
  originalTransaction: CheckoutTransaction | null,
  correctionTransactions: CheckoutTransaction[],
  itemNames: Map<number, string>,
): CheckoutItemProp[] => {
  const itemMap = new Map<number, number>();

  if (originalTransaction?.items) {
    originalTransaction.items.forEach((item) => {
      itemMap.set(item.item_id, item.quantity);
    });
  }

  // Apply correction deltas (ProcessCheckout stores and applies delta quantities)
  correctionTransactions.forEach((txn) => {
    txn.items?.forEach((item) => {
      itemMap.set(item.item_id, (itemMap.get(item.item_id) ?? 0) + item.quantity);
    });
  });

  return Array.from(itemMap.entries())
    .filter(([, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({
      id: itemId,
      name: itemNames.get(itemId) ?? `Item #${itemId}`,
      quantity,
      description: '',
    }));
};

export const buildItemMap = (item: CheckoutItemProp) => ({
  itemId: item.id,
  itemQuantity: item.quantity,
  itemNotes: item.additional_notes,
  itemDesc: item.description ?? '',
});

export const getItemName = (itemId: number, itemNames: Map<number, string>): string =>
  itemNames.get(itemId) ?? `Item #${itemId}`;

export const getItemQtyColor = (qty: number, palette: Palette) => ({
  isPositive: qty > 0,
  bgColor: qty > 0 ? palette.success.lighter : palette.error.lighter,
  textColor: qty > 0 ? palette.success.dark : palette.error.dark,
});

export const getUserName = (userId: number, userList?: User[] | null): string => {
  return userList?.find((u) => u.id === userId)?.name ?? `User ${userId}`;
};

