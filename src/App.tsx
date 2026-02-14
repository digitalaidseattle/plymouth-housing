/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useEffect, useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './pages/routes';
import ThemeCustomization from './themes/themeCustomization';
import { UserContext } from './components/contexts/UserContext';
import { ClientPrincipal, User } from './types/interfaces';
import usePersistentState from './hooks/usePersistentState';
import useAuthorization from './hooks/useAuthorization';
import { USER_ROLES } from './types/constants';
import Clarity from '@microsoft/clarity';

const router = createBrowserRouter(routes);

const App: React.FC = () => {
  const [user, setUser] = usePersistentState<ClientPrincipal | null>('user', null);
  const [loggedInUserId, setLoggedInUserId] = usePersistentState<number | null>('loggedInUserId', null);
  const [activeVolunteers, setActiveVolunteers] = usePersistentState<User[]>('activeVolunteers', []);

  useAuthorization(user, Object.values(USER_ROLES));

  useEffect(() => {
    const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (projectId) {
      Clarity.init(projectId);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      loggedInUserId,
      setLoggedInUserId,
      activeVolunteers,
      setActiveVolunteers,
      isLoading: user === null,
    }),
    [user, setUser, loggedInUserId, setLoggedInUserId, activeVolunteers, setActiveVolunteers]
  );

  return (
    <UserContext.Provider value={contextValue}>
      <ThemeCustomization>
        <RouterProvider router={router} />
      </ThemeCustomization>
    </UserContext.Provider>
  );
};

export default App;

