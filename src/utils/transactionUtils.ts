import { CheckoutItemProp, CheckoutTransaction, Transaction, User } from '../types/interfaces';
import { Palette } from '@mui/material';

export const computeEffectiveItems = (
  mainTransaction: Transaction | null,
  correctionTransactions: Transaction[],
  itemNames: Map<number, string>,
): CheckoutItemProp[] => {
  const itemMap = new Map<number, number>();

  // Start with main transaction quantities for all items
  if (mainTransaction?.items) {
    mainTransaction.items.forEach((item) => {
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

export const buildItemMap = (item: Record<string, unknown>) => {
  const hasItemId = 'item_id' in item;
  return {
    itemId: hasItemId ? item.item_id : item.id,
    itemQuantity: (item as unknown as { quantity: number }).quantity,
    itemNotes: hasItemId
      ? (item as unknown as { additional_notes?: string }).additional_notes
      : undefined,
    itemDesc: hasItemId ? '' : ((item as CheckoutItemProp).description ?? ''),
  };
};

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

export const getEffectiveItemCount = (checkoutTransaction: CheckoutTransaction): number => {
  // For edited transactions, calculate effective total from effectiveItems
  if (
    checkoutTransaction.is_edited &&
    checkoutTransaction.effectiveItems?.length
  ) {
    return checkoutTransaction.effectiveItems
      .filter((item) => item.quantity > 0)
      .reduce((sum, item) => sum + item.quantity, 0);
  }
  // Otherwise use the original total_quantity
  return checkoutTransaction.total_quantity;
};
