/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './pages/routes';
import ThemeCustomization from './themes/themeCustomization';
import { UserContext } from './components/contexts/UserContext';
import { ClientPrincipal, User } from './types/interfaces';
import usePersistentState from './hooks/usePersistentState';

const router = createBrowserRouter(routes);

const App: React.FC = () => {
  const [user, setUser] = usePersistentState<ClientPrincipal | null>('user', null);
  const [loggedInVolunteerId, setLoggedInVolunteerId] = usePersistentState<number | null>('loggedInVolunteerId', null);
  const [activeVolunteers, setActiveVolunteers] = usePersistentState<User[]>('activeVolunteers', []);
  const [loggedInAdminId, setLoggedInAdminId] = usePersistentState<number | null>('loggedInAdminId', null);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loggedInVolunteerId,
        setLoggedInVolunteerId,
        activeVolunteers,
        setActiveVolunteers,
        loggedInAdminId,
        setLoggedInAdminId,
      }}
    >
      <ThemeCustomization>
        <RouterProvider router={router} />
      </ThemeCustomization>
    </UserContext.Provider>
  );
};

export default App;
