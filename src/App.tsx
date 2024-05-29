/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
// project import
import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './pages/routes';
import ThemeCustomization from './themes/themeCustomization';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const router = createBrowserRouter(routes);


const App: React.FC = () => {
  return (
    <ThemeCustomization>
      <RouterProvider router={router} />
    </ThemeCustomization>
  );
}

export default App;
