import { describe, test, expect } from 'vitest';
import { pluralize, withCount, signNumber } from './textUtils';

describe('pluralize', () => {
  test('returns singular form when count is 1', () => {
    expect(pluralize('item', 1)).toBe('item');
  });

  test('returns plural form when count is 0', () => {
    expect(pluralize('item', 0)).toBe('items');
  });

  test('returns plural form when count is greater than 1', () => {
    expect(pluralize('item', 3)).toBe('items');
  });

  test('uses absolute value — negative -1 is singular', () => {
    expect(pluralize('item', -1)).toBe('item');
  });

  test('uses absolute value — negative -2 is plural', () => {
    expect(pluralize('item', -2)).toBe('items');
  });
});

describe('withCount', () => {
  test('returns "1 item" for count 1', () => {
    expect(withCount(1, 'item')).toBe('1 item');
  });

  test('returns "3 items" for count 3', () => {
    expect(withCount(3, 'item')).toBe('3 items');
  });

  test('returns "0 items" for count 0', () => {
    expect(withCount(0, 'item')).toBe('0 items');
  });
});

describe('signNumber', () => {
  test('prefixes positive numbers with +', () => {
    expect(signNumber(5)).toBe('+5');
  });

  test('returns negative numbers as-is', () => {
    expect(signNumber(-3)).toBe('-3');
  });

  test('returns "0" for zero', () => {
    expect(signNumber(0)).toBe('0');
  });
});
