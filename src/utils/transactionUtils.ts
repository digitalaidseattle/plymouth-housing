import { CheckoutItemProp, CheckoutTransaction, TransactionItem, User } from '../types/interfaces';
import { Palette } from '@mui/material';

export const computeEffectiveItems = (
  originalTransaction: CheckoutTransaction | null,
  correctionTransactions: CheckoutTransaction[],
  itemNames: Map<number, string>,
): CheckoutItemProp[] => {
  const itemStateMap = new Map<number, TransactionItem>();

  // Corrections store delta quantities; accumulate original first, then each correction in order.
  const accumulate = (transactionItems: TransactionItem[]) =>
    transactionItems.forEach((item) => {
      const currentItemsState = itemStateMap.get(item.item_id);
      itemStateMap.set(item.item_id, {
        ...item,
        quantity: (currentItemsState?.quantity ?? 0) + item.quantity,
        additional_notes: item.additional_notes || currentItemsState?.additional_notes || '',
      });
    });

  if (originalTransaction?.items) accumulate(originalTransaction.items);
  correctionTransactions.forEach((t) => t.items && accumulate(t.items));

  return Array.from(itemStateMap.entries())
    .filter(([, item]) => item.quantity > 0)
    .map(([itemId, { quantity, additional_notes }]) => ({
      id: itemId,
      name: itemNames.get(itemId) ?? `Item #${itemId}`,
      quantity,
      description: '',
      additional_notes,
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

