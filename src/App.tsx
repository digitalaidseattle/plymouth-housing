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
import { Admin, ClientPrincipal, Volunteer } from './types/interfaces';

const router = createBrowserRouter(routes);

const App: React.FC = () => {
  const [user, setUser] = useState<ClientPrincipal | null>(null);
  const [loggedInVolunteerId, setLoggedInVolunteerId] = useState<number | null>(null);
  const [activeVolunteers, setActiveVolunteers] = useState<Volunteer[]>([]);
  const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);
  
  return (
      <UserContext.Provider
        value={{
          user,
          setUser,
          loggedInVolunteerId: loggedInVolunteerId,
          setLoggedInVolunteerId: setLoggedInVolunteerId,
          activeVolunteers: activeVolunteers,
          setActiveVolunteers: setActiveVolunteers,
          loggedInAdmin: loggedInAdmin,
          setLoggedInAdmin: setLoggedInAdmin,
        }}
      >
    <ThemeCustomization>
      <RouterProvider router={router} />
    </ThemeCustomization>
    </UserContext.Provider>
  );
};

export default App;
