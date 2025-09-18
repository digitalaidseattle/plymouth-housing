/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useEffect} from 'react';
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

  // Clarity is used for observability in Staging and Production environments. (See documentation)
  // We should igore it in development.
  useEffect(() => {
    const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (projectId) {
      Clarity.init(projectId);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loggedInUserId,
        setLoggedInUserId,
        activeVolunteers,
        setActiveVolunteers,
        // There is a race condition where user is null at the start
        // Consider loading until user state is determined. 
        // It is used in RootRedirect to show a loading state.
        isLoading: user === null, 
      }}
    >
      <ThemeCustomization>
        <RouterProvider router={router} />
      </ThemeCustomization>
    </UserContext.Provider>
  );
};

export default App;

