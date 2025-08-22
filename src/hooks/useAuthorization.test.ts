import { renderHook } from '@testing-library/react';
import useAuthorization from './useAuthorization';
import { ClientPrincipal } from '../types/interfaces';

describe('useAuthorization', () => {
  const { location } = window;

  beforeAll(() => {
    delete window.location;
    window.location = { href: '' } as any;
  });

  afterAll(() => {
    window.location = location;
  });

  it('should do nothing if the user is null', () => {
    renderHook(() => useAuthorization(null, ['admin']));
    expect(window.location.href).toBe('');
  });

  it('should do nothing if the user has the required roles', () => {
    const user: ClientPrincipal = {
      userDetails: 'test',
      userID: 'test',
      userRoles: ['admin', 'user']
    };
    renderHook(() => useAuthorization(user, ['admin']));
    expect(window.location.href).toBe('');
  });

  it('should redirect to the logout page if the user does not have the required roles', () => {
    const user: ClientPrincipal = {
      userDetails: 'test',
      userID: 'test',
      userRoles: ['user']
    };
    renderHook(() => useAuthorization(user, ['admin']));
    expect(window.location.href).toBe('/.auth/logout?post_logout_redirect_uri=/non-authorized.html');
  });
});