/**
 *  csvExport.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, test, expect } from 'vitest';
import { toCsv } from './csvExport';

describe('toCsv', () => {
  test('joins headers and plain fields with commas and newlines', () => {
    const result = toCsv(
      ['Name', 'Age'],
      [
        ['Alice', 30],
        ['Bob', 25],
      ],
    );
    expect(result).toBe('Name,Age\nAlice,30\nBob,25');
  });

  test('quotes a field containing a comma', () => {
    const result = toCsv(['Label'], [['Seattle, WA']]);
    expect(result).toBe('Label\n"Seattle, WA"');
  });

  test('quotes a field containing a quote and doubles it', () => {
    const result = toCsv(['Label'], [['5" pipe']]);
    expect(result).toBe('Label\n"5"" pipe"');
  });

  test('quotes a field containing a newline', () => {
    const result = toCsv(['Notes'], [['line one\nline two']]);
    expect(result).toBe('Notes\n"line one\nline two"');
  });

  test('quotes a field containing a carriage return', () => {
    const result = toCsv(['Notes'], [['line one\r\nline two']]);
    expect(result).toBe('Notes\n"line one\r\nline two"');
  });

  test('leaves plain numbers unquoted', () => {
    const result = toCsv(['Count'], [[42], [0]]);
    expect(result).toBe('Count\n42\n0');
  });

  test('writes null and undefined as empty fields', () => {
    const result = toCsv(['Unit', 'Notes'], [[null, undefined]]);
    expect(result).toBe('Unit,Notes\n,');
  });

  test('neutralises a string that would be read as a formula', () => {
    const result = toCsv(['Name'], [['=cmd|calc']]);
    expect(result).toBe("Name\n'=cmd|calc");
  });

  test('leaves negative numbers alone', () => {
    const result = toCsv(['Delta'], [[-5]]);
    expect(result).toBe('Delta\n-5');
  });
});
