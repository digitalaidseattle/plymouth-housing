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

const mockUserContextValue = (role: 'admin' | 'volunteer' | null, isLoading: boolean): UserContextType => ({
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

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/:source" element={ui} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/inventory" element={<div>Inventory Page</div>} />
        <Route path="/checkout" element={<div>Checkout Page</div>} />
        <Route path="/people" element={<div>People Page</div>} />
        <Route path="/volunteer-home" element={<div>Volunteer Home Page</div>} />
        <Route path="/404" element={<div data-testid="page-404">404 Page</div>} />
      </Routes>
    </MemoryRouter>
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

  it('redirects to /inventory if user has no role', () => {
    const contextValue = mockUserContextValue(null, false);
    renderWithRouter(
      <UserContext.Provider value={contextValue}>
        <RootRedirect source="some-page">
          <div>Child Content</div>
        </RootRedirect>
      </UserContext.Provider>,
      { route: '/some-page' }
    );
    expect(screen.getByText('Inventory Page')).toBeInTheDocument();
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

  it('redirects to the first permitted page if user does not have permission', () => {
    const contextValue = mockUserContextValue('volunteer', false);
    renderWithRouter(
      <UserContext.Provider value={contextValue}>
        <RootRedirect source="people">
          <div>Child Content</div>
        </RootRedirect>
      </UserContext.Provider>,
      { route: '/people' }
    );
    // volunteer's first page is 'volunteer-home'
    expect(screen.getByText('Volunteer Home Page')).toBeInTheDocument();
  });

  it('admin redirects to the first permitted page if they access volunteer page', () => {
    const contextValue = mockUserContextValue('admin', false);
    renderWithRouter(
      <UserContext.Provider value={contextValue}>
        <RootRedirect source="volunteer-home">
          <div>Child Content</div>
        </RootRedirect>
      </UserContext.Provider>,
      { route: '/volunteer-home' }
    );
    // admin's first page is 'inventory'
    expect(screen.getByText('Inventory Page')).toBeInTheDocument();
  });

  it('renders 404 for a non-existent page', () => {
    const contextValue = mockUserContextValue('admin', false);
     renderWithRouter(
      <UserContext.Provider value={contextValue}>
        <RootRedirect source="non-existent-page">
          <div>Child Content</div>
        </RootRedirect>
      </UserContext.Provider>,
      { route: '/non-existent-page' }
    );
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