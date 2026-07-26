/**
 *  MainLayout/index.test.tsx
 *
 *  Covers the guardrail that refuses test-role accounts in production.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import MainLayout from './index';
import { UserContext } from '../../components/contexts/UserContext';
import { UserContextType } from '../../types/interfaces';

const LOGOUT_URL = '/.auth/logout?post_logout_redirect_uri=/login.html';

// ENVIRONMENT is a build-time constant, so it is swapped per test through a
// hoisted holder the module mock reads on every access.
const env = vi.hoisted(() => ({ value: 'development' }));

vi.mock('../../types/constants', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../types/constants')>();
  return {
    ...actual,
    get ENVIRONMENT() {
      return env.value;
    },
  };
});

const { getAuthMe } = vi.hoisted(() => ({ getAuthMe: vi.fn() }));
const { trackEvent } = vi.hoisted(() => ({ trackEvent: vi.fn() }));
const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));
const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('../../services/authService', () => ({ getAuthMe }));
vi.mock('../../utils/appInsights', () => ({ trackEvent }));
vi.mock('../../services/apiRequest', () => ({ apiRequest }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigate,
    Outlet: () => <div>Outlet Content</div>,
  };
});

// The chrome around the outlet is irrelevant here; stub it out so the test
// exercises the guard rather than MUI layout internals.
vi.mock('./Header', () => ({ default: () => <div>Header</div> }));
vi.mock('./Drawer', () => ({ default: () => <div>Drawer</div> }));
vi.mock('../../components/@extended/Breadcrumbs', () => ({
  default: () => <div>Breadcrumbs</div>,
}));

const contextValue = (): UserContextType => ({
  user: null,
  setUser: vi.fn(),
  loggedInUserId: null,
  setLoggedInUserId: vi.fn(),
  activeVolunteers: [],
  setActiveVolunteers: vi.fn(),
  isLoading: false,
});

const renderLayout = () =>
  render(
    <UserContext.Provider value={contextValue()}>
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    </UserContext.Provider>,
  );

const authAs = (userRoles: string[] | undefined) =>
  getAuthMe.mockResolvedValue({
    clientPrincipal: {
      userId: 'user@example.com',
      userDetails: 'Test User',
      userRoles,
    },
  });

describe('MainLayout - production test-account guard', () => {
  let clearSpy: ReturnType<typeof vi.spyOn>;
  let originalLocation: Location;

  beforeEach(() => {
    vi.clearAllMocks();
    env.value = 'development';
    apiRequest.mockResolvedValue({ value: [{ id: 1 }] });
    clearSpy = vi
      .spyOn(Storage.prototype, 'clear')
      .mockImplementation(() => {});

    originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  afterEach(() => {
    clearSpy.mockRestore();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('blocks a test account in production', async () => {
    env.value = 'production';
    authAs(['volunteer', 'test']);

    renderLayout();

    await waitFor(() =>
      expect(trackEvent).toHaveBeenCalledWith('TestAccountBlockedInProduction', {
        environment: 'production',
        userDetails: 'Test User',
        userRoles: 'volunteer,test',
      }),
    );
    expect(clearSpy).toHaveBeenCalled();
    expect(window.location.href).toBe(LOGOUT_URL);
  });

  it('renders nothing and skips role processing for a blocked account', async () => {
    env.value = 'production';
    authAs(['admin', 'test']);

    const { container } = renderLayout();

    await waitFor(() => expect(trackEvent).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Outlet Content')).not.toBeInTheDocument();
    // The admin upsert and the volunteer redirect must never run.
    expect(apiRequest).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('allows a test account outside production', async () => {
    env.value = 'staging';
    authAs(['volunteer', 'test']);

    renderLayout();

    expect(await screen.findByText('Outlet Content')).toBeInTheDocument();
    expect(trackEvent).not.toHaveBeenCalled();
    expect(window.location.href).toBe('');
    // Volunteer without a logged-in id still goes to the name picker.
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/pick-your-name'));
  });

  it('allows a non-test account in production', async () => {
    env.value = 'production';
    authAs(['admin']);

    renderLayout();

    expect(await screen.findByText('Outlet Content')).toBeInTheDocument();
    expect(trackEvent).not.toHaveBeenCalled();
    expect(window.location.href).toBe('');
    // Admin processing continues as usual.
    await waitFor(() => expect(apiRequest).toHaveBeenCalled());
  });

  it('allows an account with no roles in production', async () => {
    env.value = 'production';
    authAs(undefined);

    renderLayout();

    expect(await screen.findByText('Outlet Content')).toBeInTheDocument();
    expect(trackEvent).not.toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });

  it('renders the layout when the auth lookup fails in production', async () => {
    env.value = 'production';
    getAuthMe.mockRejectedValue(new Error('auth down'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderLayout();

    expect(await screen.findByText('Outlet Content')).toBeInTheDocument();
    expect(window.location.href).toBe('');
    consoleError.mockRestore();
  });
});
