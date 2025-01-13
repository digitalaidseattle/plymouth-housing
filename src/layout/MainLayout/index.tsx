/**
 *  MainLayout/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import navigation from '../../menu-items';
import Drawer from './Drawer';
import Header from './Header';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import ScrollTop from '../../components/ScrollTop';
import { DrawerOpenContext } from '../../components/contexts/DrawerOpenContext';
import { RefreshContextProvider } from '../../components/contexts/RefreshContextProvider';
import { UserContext } from '../../components/contexts/UserContext';
import { useMsal } from '@azure/msal-react';
import { Volunteer, ClientPrincipal } from '../../types/interfaces';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const [user, setUser] = useState<ClientPrincipal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [loggedInVolunteer, setLoggedInVolunteer] = useState<Volunteer | null>(
    null,
  );
  const [activeVolunteers, setActiveVolunteers] = useState<Volunteer[]>([]);
  const location = useLocation();
  const { volunteerId, volunteers } = location.state || {};
  const navigate = useNavigate();
  const { instance } = useMsal();

  useEffect(() => {
    const fetchTokenAndVolunteers = async () => {

      const response = await fetch('/.auth/me');
      const payload = await response.json();
      const { clientPrincipal } = payload;
    
      try {
        const userClaims = clientPrincipal;
        setUser(userClaims || null);

        if (volunteers?.length > 0 && activeVolunteers.length === 0) {
          setActiveVolunteers(volunteers);
        }

        // Find and set the current volunteer's name
        if (volunteerId && volunteers?.length > 0) {
          const currentVolunteer = volunteers.find(
            (v: Volunteer) => v.id === volunteerId,
          );
          if (currentVolunteer) {
            setLoggedInVolunteer(currentVolunteer);
          }
        }
      } catch (error) {
        console.error('Error in fetchTokenAndVolunteers:', error);
        navigate('/login');
      }
    };

    fetchTokenAndVolunteers();
  }, [instance, navigate, volunteerId, volunteers, activeVolunteers.length]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // set media wise responsive drawer
  useEffect(() => {
    setDrawerOpen(!matchDownLG);
  }, [matchDownLG]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loggedInVolunteer: loggedInVolunteer,
        setLoggedInVolunteer: setLoggedInVolunteer,
        activeVolunteers: activeVolunteers,
        setActiveVolunteers: setActiveVolunteers,
      }}
    >
      {user && (
        <DrawerOpenContext.Provider value={{ drawerOpen, setDrawerOpen }}>
          <RefreshContextProvider>
            <ScrollTop>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <Header
                  open={drawerOpen}
                  handleDrawerToggle={handleDrawerToggle}
                />
                <Drawer
                  open={drawerOpen}
                  handleDrawerToggle={handleDrawerToggle}
                />
                <Box
                  component="main"
                  sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 } }}
                >
                  <Toolbar />
                  <Breadcrumbs navigation={navigation} title />
                  <Outlet context={{ drawerOpen }} />
                </Box>
              </Box>
            </ScrollTop>
          </RefreshContextProvider>
        </DrawerOpenContext.Provider>
      )}
    </UserContext.Provider>
  );
};

export default MainLayout;
