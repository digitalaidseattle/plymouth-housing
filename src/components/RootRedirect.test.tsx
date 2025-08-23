
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RootRedirect } from './RootRedirect';
import { UserContext } from './contexts/UserContext';
import { ROLE_PAGES } from '../types/constants';

describe('RootRedirect', () => {
  const TestComponent = () => <div>Test Component</div>;

  const renderWithRouter = (ui: React.ReactElement, { user = null } = {}) => {
    return render(
      <UserContext.Provider value={{ user } as any}>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  it('should render children if user has required role', () => {
    const user = { userRoles: ['admin'] };
    renderWithRouter(<RootRedirect source={ROLE_PAGES.admin[0]}><TestComponent /></RootRedirect>, { user });
    expect(screen.getByText('Test Component')).not.toBeNull();
  });

  it('should attempt to redirect if user has no role', () => {
    const { container } = renderWithRouter(<RootRedirect source="some-page"><TestComponent /></RootRedirect>, { user: null });
    // We expect the Navigate component to be rendered, but we can't directly test it.
    // Instead, we check that the children are not rendered.
    expect(screen.queryByText('Test Component')).toBeNull();
  });

  it('should attempt to redirect if user does not have required role', () => {
    const user = { userRoles: ['volunteer'] };
    renderWithRouter(<RootRedirect source={ROLE_PAGES.admin[0]}><TestComponent /></RootRedirect>, { user });
    expect(screen.queryByText('Test Component')).toBeNull();
  });

  it('should render Page404 for invalid source', () => {
    const user = { userRoles: ['admin'] };
    renderWithRouter(<RootRedirect source="invalid-page"><TestComponent /></RootRedirect>, { user });
    expect(screen.queryByText('Test Component')).toBeNull();
    // We expect the Page404 component to be rendered.
    // We can check for some text that is unique to the Page404 component.
    expect(screen.getByText('Page not found')).not.toBeNull();
  });
});
