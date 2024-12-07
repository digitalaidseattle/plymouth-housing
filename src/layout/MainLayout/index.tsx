/**
 *  MainLayout/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// material-ui
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import navigation from '../../menu-items';
import Drawer from './Drawer';
import Header from './Header';

// types
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import ScrollTop from '../../components/ScrollTop';
import { DrawerOpenContext } from '../../components/contexts/DrawerOpenContext';
import { RefreshContextProvider } from '../../components/contexts/RefreshContext';
import { UserContext } from '../../components/contexts/UserContext';
import { useMsal } from '@azure/msal-react';
import { IdTokenClaims } from '@azure/msal-common';
import {VolunteerIdName} from '../../types/interfaces';



// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const [user, setUser] = useState<IdTokenClaims | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [loginedVolunteer, setLoginedVolunteer] = useState<VolunteerIdName|null>(null);
  const [activatedVolunteers, setActivatedVolunteers] = useState<VolunteerIdName[]>([]);
  const location = useLocation();
  const { volunteerId, volunteers } = location.state || {};
  const navigate = useNavigate();
  const { instance } = useMsal();

  useEffect(() => {
    const fetchTokenAndVolunteers = async () => {
      const account = instance.getActiveAccount();
      if (!account) {
        console.log('Cannot get account, redirecting to login');
        navigate('/login');
        return;
      }
  
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          account: account,
          scopes: ['openid', 'profile', 'email', 'User.Read'],
        });
  
        const userClaims = tokenResponse.idTokenClaims;
        setUser(userClaims || null);

        if (volunteers?.length > 0 && activatedVolunteers.length === 0) {
          setActivatedVolunteers(volunteers);
        }

      // Find and set the current volunteer's name
      if (volunteerId && volunteers?.length > 0) {
          const currentVolunteer = volunteers.find(
            (v: VolunteerIdName) => v.id === volunteerId
          );
          if (currentVolunteer) {
            setLoginedVolunteer(currentVolunteer);
          }
        }
      } catch (error) {
        console.error('Error in fetchTokenAndVolunteers:', error);
      }
    };
  
    fetchTokenAndVolunteers();
  }, [instance, navigate, volunteerId, volunteers, activatedVolunteers.length]);

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
        loginedVolunteer,
        setLoginedVolunteer,
        activatedVolunteers,
        setActivatedVolunteers,
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
                  <Outlet />
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
