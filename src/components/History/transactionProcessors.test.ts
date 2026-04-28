import { describe, test, expect } from 'vitest';
import { mapCheckoutRows, processTransactionsByUser } from './transactionProcessors';
import { CheckoutRow, CheckoutTransaction, TransactionType } from '../../types/interfaces';

const makeTransaction = (userId: number, txnId: string): CheckoutTransaction => ({
  user_id: userId,
  transaction_id: txnId,
  building_id: 1,
  building_code: 'A',
  building_name: 'Building A',
  item_type: 'general',
  resident_id: 10,
  resident_name: 'Resident A',
  transaction_date: '2025-01-01T00:00:00Z',
  unit_number: '101',
  welcome_basket_item_id: null,
  welcome_basket_quantity: null,
  total_quantity: 3,
  is_edited: false,
});

describe('processTransactionsByUser', () => {
  test('returns empty array for empty input', () => {
    expect(processTransactionsByUser([], 1)).toEqual([]);
  });

  test('groups transactions by user', () => {
    const txns = [makeTransaction(1, 'a'), makeTransaction(2, 'b'), makeTransaction(1, 'c')];
    const result = processTransactionsByUser(txns, 99);
    const user1 = result.find((g) => g.user_id === 1);
    const user2 = result.find((g) => g.user_id === 2);
    expect(user1?.transactions).toHaveLength(2);
    expect(user2?.transactions).toHaveLength(1);
  });

  test('places the logged-in user first', () => {
    const txns = [makeTransaction(1, 'a'), makeTransaction(2, 'b'), makeTransaction(3, 'c')];
    const result = processTransactionsByUser(txns, 2);
    expect(result[0].user_id).toBe(2);
  });

  test('preserves order when logged-in user is not in the list', () => {
    const txns = [makeTransaction(1, 'a'), makeTransaction(2, 'b')];
    const result = processTransactionsByUser(txns, 99);
    expect(result[0].user_id).toBe(1);
    expect(result[1].user_id).toBe(2);
  });

  test('logged-in user appears exactly once even with multiple transactions', () => {
    const txns = [makeTransaction(1, 'a'), makeTransaction(1, 'b'), makeTransaction(2, 'c')];
    const result = processTransactionsByUser(txns, 1);
    expect(result).toHaveLength(2);
    expect(result[0].user_id).toBe(1);
    expect(result[0].transactions).toHaveLength(2);
  });
});

const baseRow: CheckoutRow = {
  user_id: 1,
  transaction_id: 'txn-1',
  transaction_type: TransactionType.Checkout,
  parent_transaction_id: null,
  resident_id: 10,
  resident_name: 'Resident A',
  unit_number: '101',
  building_id: 1,
  building_code: 'A',
  building_name: 'Building A',
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

  test('keeps original total_quantity and sets is_edited=true when edits exist', () => {
    const result = mapCheckoutRows([baseRow, editRow('edit-1', 'txn-1', 3)]);

    expect(result).toHaveLength(1);
    expect(result[0].total_quantity).toBe(7);
    expect(result[0].is_edited).toBe(true);
  });

  test('keeps original total_quantity with multiple edits and sets is_edited=true', () => {
    const result = mapCheckoutRows([
      baseRow,
      editRow('edit-1', 'txn-1', 3),
      editRow('edit-2', 'txn-1', -2),
    ]);

    expect(result[0].total_quantity).toBe(7);
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
    expect(txn1.total_quantity).toBe(7);
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
