import { describe, test, expect } from 'vitest';
import {
  computeEffectiveItems,
  computeCartDeltas,
  buildItemMap,
  getItemName,
  getUserName,
  getItemQtyColor,
} from './transactionUtils';
import { CheckoutItemProp, CheckoutTransaction } from '../types/interfaces';

const baseTransaction: CheckoutTransaction = {
  building_id: 1,
  building_code: 'A',
  building_name: 'Building A',
  item_type: 'general',
  resident_id: 10,
  resident_name: 'Resident A',
  transaction_date: '2025-01-01T00:00:00Z',
  transaction_id: 'txn-1',
  unit_number: '101',
  user_id: 1,
  welcome_basket_item_id: null,
  welcome_basket_quantity: null,
  total_quantity: 5,
  is_edited: false,
};

const makeItem = (item_id: number, quantity: number, txnId = 'txn-1') => ({
  id: item_id,
  item_id,
  quantity,
  transaction_id: txnId,
  additional_notes: '',
});

describe('computeEffectiveItems', () => {
  test('returns empty array when original transaction is null', () => {
    expect(computeEffectiveItems(null, [], new Map())).toEqual([]);
  });

  test('returns empty array when original has no items', () => {
    const result = computeEffectiveItems(
      { ...baseTransaction, items: [] },
      [],
      new Map(),
    );
    expect(result).toEqual([]);
  });

  test('maps original items with names from itemNames', () => {
    const itemNames = new Map([[1, 'Blanket']]);
    const original = { ...baseTransaction, items: [makeItem(1, 2)] };
    const result = computeEffectiveItems(original, [], itemNames);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 1, name: 'Blanket', quantity: 2 });
  });

  test('falls back to "Item #N" when item is missing from itemNames', () => {
    const original = { ...baseTransaction, items: [makeItem(99, 1)] };
    const result = computeEffectiveItems(original, [], new Map());
    expect(result[0].name).toBe('Item #99');
  });

  test('applies correction transaction deltas to quantities', () => {
    const itemNames = new Map([[1, 'Blanket']]);
    const original = { ...baseTransaction, items: [makeItem(1, 3)] };
    const correction = { ...baseTransaction, items: [makeItem(1, 2, 'txn-2')] };
    const result = computeEffectiveItems(original, [correction], itemNames);
    expect(result[0].quantity).toBe(5);
  });

  test('filters out items whose effective quantity is zero or negative', () => {
    const original = { ...baseTransaction, items: [makeItem(1, 2)] };
    const correction = { ...baseTransaction, items: [makeItem(1, -2, 'txn-2')] };
    const result = computeEffectiveItems(original, [correction], new Map());
    expect(result).toHaveLength(0);
  });

  test('correction can introduce a new item not in original', () => {
    const itemNames = new Map([[2, 'Chair']]);
    const original = { ...baseTransaction, items: [makeItem(1, 1)] };
    const correction = { ...baseTransaction, items: [makeItem(2, 3, 'txn-2')] };
    const result = computeEffectiveItems(original, [correction], itemNames);
    const chair = result.find((r) => r.id === 2);
    expect(chair).toBeDefined();
    expect(chair!.quantity).toBe(3);
  });

});

describe('getItemName', () => {
  test('returns the name from the map when found', () => {
    expect(getItemName(1, new Map([[1, 'Blanket']]))).toBe('Blanket');
  });

  test('returns "Item #N" fallback when not found', () => {
    expect(getItemName(42, new Map())).toBe('Item #42');
  });
});

describe('getUserName', () => {
  const users = [
    { id: 1, name: 'Alice', active: true, created_at: '', last_signed_in: null, role: 'admin' as const, PIN: null as null },
    { id: 2, name: 'Bob', active: true, created_at: '', last_signed_in: null, role: 'volunteer' as const, PIN: '1234' },
  ];

  test('returns the user name when user is found', () => {
    expect(getUserName(1, users)).toBe('Alice');
  });

  test('returns "User N" fallback when user is not found', () => {
    expect(getUserName(99, users)).toBe('User 99');
  });

  test('returns "User N" fallback when userList is null', () => {
    expect(getUserName(1, null)).toBe('User 1');
  });

  test('returns "User N" fallback when userList is undefined', () => {
    expect(getUserName(1, undefined)).toBe('User 1');
  });
});

describe('buildItemMap', () => {
  test('extracts fields from a CheckoutItemProp', () => {
    const item = {
      id: 5,
      name: 'Chair',
      quantity: 3,
      description: 'Folding',
      additional_notes: 'Near door',
    };
    expect(buildItemMap(item)).toEqual({
      itemId: 5,
      itemQuantity: 3,
      itemNotes: 'Near door',
      itemDesc: 'Folding',
    });
  });

  test('itemDesc defaults to empty string when description is undefined', () => {
    const item = { id: 1, name: 'Table', quantity: 1, description: undefined as unknown as string };
    expect(buildItemMap(item).itemDesc).toBe('');
  });
});

describe('getItemQtyColor', () => {
  const palette = {
    success: { lighter: '#e8f5e9', dark: '#1b5e20' },
    error: { lighter: '#ffebee', dark: '#b71c1c' },
  };

  test('returns positive colors for qty > 0', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = getItemQtyColor(3, palette as any);
    expect(result.isPositive).toBe(true);
    expect(result.bgColor).toBe(palette.success.lighter);
    expect(result.textColor).toBe(palette.success.dark);
  });

  test('returns negative colors for qty < 0', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = getItemQtyColor(-1, palette as any);
    expect(result.isPositive).toBe(false);
    expect(result.bgColor).toBe(palette.error.lighter);
    expect(result.textColor).toBe(palette.error.dark);
  });

  test('returns negative colors for qty === 0', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = getItemQtyColor(0, palette as any);
    expect(result.isPositive).toBe(false);
  });
});

const makeCartItem = (id: number, quantity: number, name = `Item #${id}`): CheckoutItemProp => ({
  id,
  name,
  quantity,
  description: '',
});

describe('computeCartDeltas', () => {
  test('returns empty array when effectiveItems is undefined', () => {
    const cart = [makeCartItem(1, 2)];
    expect(computeCartDeltas(cart, undefined)).toEqual([]);
  });

  test('returns empty array when cart and effective items are identical', () => {
    const items = [makeCartItem(1, 2), makeCartItem(2, 3)];
    expect(computeCartDeltas(items, items)).toEqual([]);
  });

  test('returns cart item when its quantity changed', () => {
    const cartItem = makeCartItem(1, 5);
    const effectiveItem = makeCartItem(1, 2);
    const result = computeCartDeltas([cartItem], [effectiveItem]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(cartItem);
  });

  test('returns effective item when it was removed from cart (qty 0)', () => {
    const effectiveItem = makeCartItem(1, 3);
    const result = computeCartDeltas([], [effectiveItem]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(effectiveItem);
  });

  test('returns cart item when it is newly added (not in effective)', () => {
    const newItem = makeCartItem(2, 1);
    const effectiveItem = makeCartItem(1, 3);
    const result = computeCartDeltas([makeCartItem(1, 3), newItem], [effectiveItem]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(newItem);
  });

  test('returns only changed items when multiple items are present', () => {
    const unchanged = makeCartItem(1, 2);
    const changed = makeCartItem(2, 5);
    const effective = [makeCartItem(1, 2), makeCartItem(2, 3)];
    const result = computeCartDeltas([unchanged, changed], effective);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(changed);
  });

  test('returns both added and removed items when cart diverges significantly', () => {
    const addedItem = makeCartItem(2, 1);
    const removedItem = makeCartItem(1, 3);
    const result = computeCartDeltas([addedItem], [removedItem]);
    const ids = result.map((i) => i.id);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
    expect(result).toHaveLength(2);
  });

  test('returns empty array when both cart and effective items are empty', () => {
    expect(computeCartDeltas([], [])).toEqual([]);
  });
});
