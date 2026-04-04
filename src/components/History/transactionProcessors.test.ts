import { describe, test, expect } from 'vitest';
import { mapCheckoutRows } from './transactionProcessors';
import { CheckoutRow, TransactionType } from '../../types/interfaces';

const baseRow: CheckoutRow = {
  user_id: 1,
  transaction_id: 'txn-1',
  transaction_type: TransactionType.Checkout,
  parent_transaction_id: null,
  resident_id: 10,
  resident_name: 'Resident A',
  unit_number: '101',
  building_id: 1,
  transaction_date: '2025-01-01T00:00:00Z',
  total_quantity: 7,
  welcome_basket_item_id: null,
  welcome_basket_quantity: null,
};

const editRow = (
  id: string,
  parentId: string,
  quantity: number,
): CheckoutRow => ({
  ...baseRow,
  transaction_id: id,
  transaction_type: TransactionType.CheckoutEdit,
  parent_transaction_id: parentId,
  total_quantity: quantity,
});

describe('mapCheckoutRows', () => {
  test('returns checkout transaction with is_edited=false when no edits exist', () => {
    const result = mapCheckoutRows([baseRow]);

    expect(result).toHaveLength(1);
    expect(result[0].is_edited).toBe(false);
    expect(result[0].total_quantity).toBe(7);
  });

  test('applies a single edit delta to total_quantity and sets is_edited=true', () => {
    const result = mapCheckoutRows([baseRow, editRow('edit-1', 'txn-1', 3)]);

    expect(result).toHaveLength(1);
    expect(result[0].total_quantity).toBe(10);
    expect(result[0].is_edited).toBe(true);
  });

  test('applies multiple edit deltas including negative values', () => {
    const result = mapCheckoutRows([
      baseRow,
      editRow('edit-1', 'txn-1', 3),
      editRow('edit-2', 'txn-1', -2),
    ]);

    expect(result[0].total_quantity).toBe(8);
    expect(result[0].is_edited).toBe(true);
  });

  test('filters edit rows out of the result', () => {
    const result = mapCheckoutRows([baseRow, editRow('edit-1', 'txn-1', 3)]);

    expect(result).toHaveLength(1);
    expect(result[0].transaction_id).toBe('txn-1');
  });

  test('edit row with null parent_transaction_id does not affect any transaction', () => {
    const orphanEdit: CheckoutRow = {
      ...editRow('edit-orphan', 'txn-1', 5),
      parent_transaction_id: null,
    };

    const result = mapCheckoutRows([baseRow, orphanEdit]);

    expect(result[0].total_quantity).toBe(7);
    expect(result[0].is_edited).toBe(false);
  });

  test('edits for one transaction do not affect another', () => {
    const secondRow: CheckoutRow = {
      ...baseRow,
      transaction_id: 'txn-2',
      total_quantity: 5,
    };

    const result = mapCheckoutRows([
      baseRow,
      secondRow,
      editRow('edit-1', 'txn-1', 3),
    ]);

    const txn1 = result.find((r) => r.transaction_id === 'txn-1')!;
    const txn2 = result.find((r) => r.transaction_id === 'txn-2')!;
    expect(txn1.total_quantity).toBe(10);
    expect(txn1.is_edited).toBe(true);
    expect(txn2.total_quantity).toBe(5);
    expect(txn2.is_edited).toBe(false);
  });

  test('sets item_type to "welcome" when welcome_basket_item_id is present', () => {
    const welcomeRow: CheckoutRow = {
      ...baseRow,
      welcome_basket_item_id: 171,
      welcome_basket_quantity: 1,
    };

    const result = mapCheckoutRows([welcomeRow]);

    expect(result[0].item_type).toBe('welcome');
  });

  test('sets item_type to "general" when welcome_basket_item_id is null', () => {
    const result = mapCheckoutRows([baseRow]);

    expect(result[0].item_type).toBe('general');
  });
});
