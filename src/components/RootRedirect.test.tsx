import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RootRedirect } from './RootRedirect';
import { UserContext } from './contexts/UserContext';
import { UserContextType } from '../types/interfaces';

// Mock the Page404 component
vi.mock('../pages/error/404', () => ({
  default: () => <div>404 Page</div>,
}));

const VolunteerHomePage = () => (
  <RootRedirect source="volunteer-home">
    <div>Volunteer Home Page</div>
  </RootRedirect>
);

const PeoplePage = () => (
  <RootRedirect source="people">
    <div>People Page</div>
  </RootRedirect>
);

const InventoryPage = () => (
  <RootRedirect source="inventory">
    <div>Inventory Page</div>
  </RootRedirect>
);

const CheckoutPage = () => (
  <RootRedirect source="checkout">
    <div>Checkout Page</div>
  </RootRedirect>
);

// For non-existent pages, you can use a generic wrapper
const GenericRedirectPage = ({ source }: { source: string }) => (
  <RootRedirect source={source}>
    <div>Child Content</div>
  </RootRedirect>
);


const mockUserContextValue = (role: 'admin' | 'volunteer' | null | undefined, isLoading: boolean): UserContextType => ({
  user: role ? {
    userRoles: [role],
    userID: 'test-user-id',
    userDetails: 'test-user-details'
  } : null,
  isLoading,
  setUser: vi.fn(),
  loggedInUserId: null,
  setLoggedInUserId: vi.fn(),
  activeVolunteers: [],
  setActiveVolunteers: vi.fn(),
});

const renderWithRouter = (contextValue: any, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <UserContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/volunteer-home" element={<VolunteerHomePage />} />
          <Route path="/404" element={<div data-testid="page-404">404 Page</div>} />
          <Route path="/:source" element={<GenericRedirectPage source={route.slice(1)} />} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );
};

describe('RootRedirect', () => {
  it('shows loading message when isLoading is true', () => {
    const contextValue = mockUserContextValue('admin', true);
    render(
      <UserContext.Provider value={contextValue}>
        <RootRedirect source="inventory">
          <div>Child Content</div>
        </RootRedirect>
      </UserContext.Provider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders children if user has permission for the source page', () => {
    const contextValue = mockUserContextValue('admin', false);
    render(
      <UserContext.Provider value={contextValue}>
        <RootRedirect source="people">
          <div>People Page Content</div>
        </RootRedirect>
      </UserContext.Provider>
    );
    expect(screen.getByText('People Page Content')).toBeInTheDocument();
  });

  it('volunteer redirects to the first permitted page if he has no permission', () => {
    const contextValue = mockUserContextValue('volunteer', false);
    renderWithRouter(contextValue, { route: '/people' });
    expect(screen.getByText('Volunteer Home Page')).toBeInTheDocument();
  });

  it('admin redirects to the first permitted page if they access volunteer page', () => {
    const contextValue = mockUserContextValue('admin', false);
    renderWithRouter(contextValue, { route: '/volunteer-home' });
    expect(screen.getByText('Inventory Page')).toBeInTheDocument();
  });

  it('renders 404 for a non-existent page', () => {
    const contextValue = mockUserContextValue('admin', false);
    renderWithRouter(contextValue, { route: '/non-existent-page' });
    expect(screen.getByText('404 Page')).toBeInTheDocument();
  });
  it('allows volunteer to access shared page', () => {
    const contextValue = mockUserContextValue('volunteer', false);
    render(
      <UserContext.Provider value={contextValue}>
        <RootRedirect source="inventory">
          <div>Inventory Page Content</div>
        </RootRedirect>
      </UserContext.Provider>
    );
    expect(screen.getByText('Inventory Page Content')).toBeInTheDocument();
  });
});

describe('RootRedirect - invalid userRole handling', () => {
  let mockLocalStorageClear: any;
  let originalLocation: Location;

  beforeEach(() => {
    mockLocalStorageClear = vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => { });

    originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: ''
      }
    });
  });

  afterEach(() => {
    mockLocalStorageClear.mockRestore();

    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation
    });
  });

  it('clears localStorage and redirects to logout when userRole is null', () => {
    const contextValue = mockUserContextValue(null, false);

    renderWithRouter(contextValue, { route: '/volunteer-home' });

    expect(mockLocalStorageClear).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/.auth/logout?post_logout_redirect_uri=/login.html');
  });

  it('clears localStorage and redirects to logout when userRole is undefined', () => {
    const contextValue = mockUserContextValue(undefined, false);

    renderWithRouter(contextValue, { route: '/people' });

    expect(mockLocalStorageClear).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe('/.auth/logout?post_logout_redirect_uri=/login.html');
  });
});