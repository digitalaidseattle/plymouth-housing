/**
 *  userUtils.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, test, expect } from 'vitest';
import { getHomePath } from './userUtils';
import { ClientPrincipal } from '../types/interfaces';

const userWithRoles = (userRoles: string[]): ClientPrincipal =>
  ({
    userId: '1',
    userDetails: 'Test User',
    userRoles,
  }) as ClientPrincipal;

describe('getHomePath', () => {
  test('sends an admin to the admin home page, not inventory', () => {
    expect(getHomePath(userWithRoles(['admin']))).toBe('/admin-home');
  });

  test('sends a volunteer to the volunteer home page', () => {
    expect(getHomePath(userWithRoles(['volunteer']))).toBe('/volunteer-home');
  });

  test('follows getRole and prefers volunteer when a user holds both roles', () => {
    expect(getHomePath(userWithRoles(['admin', 'volunteer']))).toBe(
      '/volunteer-home',
    );
  });

  test('falls back to the root path when there is no user', () => {
    expect(getHomePath(null)).toBe('/');
  });
});
