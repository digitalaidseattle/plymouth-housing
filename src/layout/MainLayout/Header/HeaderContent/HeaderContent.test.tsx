/**
 *  HeaderContent.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HeaderContent from './index';
import { UserContext } from '../../../../components/contexts/UserContext';

// Irrelevant to where the Home button points.
vi.mock('./Profile', () => ({
  default: () => <div data-testid="profile" />,
}));
vi.mock('./MobileSection', () => ({
  default: () => <div data-testid="mobile-section" />,
}));
vi.mock('./VolunteerSwitcher', () => ({
  default: () => <div data-testid="volunteer-switcher" />,
}));

const renderWithRoles = (userRoles: string[]) =>
  render(
    <UserContext.Provider
      value={{
        user: { userId: '1', userDetails: 'Test User', userRoles },
        setUser: vi.fn(),
        loggedInUserId: 1,
        setLoggedInUserId: vi.fn(),
        activeVolunteers: [],
        setActiveVolunteers: vi.fn(),
        isLoading: false,
      }}
    >
      <MemoryRouter>
        <HeaderContent />
      </MemoryRouter>
    </UserContext.Provider>,
  );

describe('HeaderContent Home button', () => {
  test('points a volunteer at the volunteer home route', () => {
    renderWithRoles(['volunteer']);

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      '/volunteer-home',
    );
  });

  test('points an admin at the admin home route', () => {
    renderWithRoles(['admin']);

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      '/admin-home',
    );
  });

  // '/' renders Home but leaves the sidebar unhighlighted, because NavItem
  // matches on pathname.includes(item.url).
  test('links to a concrete route rather than the root path', () => {
    renderWithRoles(['volunteer']);

    expect(screen.getByRole('link', { name: /home/i })).not.toHaveAttribute(
      'href',
      '/',
    );
  });
});