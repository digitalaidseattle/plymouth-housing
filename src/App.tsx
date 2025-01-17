/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
// project import
import React, { useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './pages/routes';
import ThemeCustomization from './themes/themeCustomization';
import { UserContext } from './components/contexts/UserContext';
import { ClientPrincipal, Volunteer } from './types/interfaces';

const router = createBrowserRouter(routes);

const App: React.FC = () => {
  const [user, setUser] = useState<ClientPrincipal | null>(null);
  const [loggedInVolunteerId, setLoggedInVolunteerId] = useState<number | null>(null);
  const [activeVolunteers, setActiveVolunteers] = useState<Volunteer[]>([]);
  const [loggedInAdminId, setLoggedInAdminId] = useState<number | null>(null);
  
  return (
      <UserContext.Provider
        value={{
          user,
          setUser,
          loggedInVolunteerId: loggedInVolunteerId,
          setLoggedInVolunteerId: setLoggedInVolunteerId,
          activeVolunteers: activeVolunteers,
          setActiveVolunteers: setActiveVolunteers,
          loggedInAdminId: loggedInAdminId,
          setLoggedInAdminId: setLoggedInAdminId,
        }}
      >
    <ThemeCustomization>
      <RouterProvider router={router} />
    </ThemeCustomization>
    </UserContext.Provider>
  );
};

export default App;
