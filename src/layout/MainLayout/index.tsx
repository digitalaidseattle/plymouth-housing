/**
 *  MainLayout/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useContext, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import navigation from '../../menu-items';
import Drawer from './Drawer';
import Header from './Header';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import ScrollTop from '../../components/ScrollTop';
import SnackbarAlert from '../../components/SnackbarAlert';
import { DrawerOpenContext } from '../../components/contexts/DrawerOpenContext';
import { UserContext } from '../../components/contexts/UserContext';
import { AdminUser, User } from '../../types/interfaces';
import { useInactivityTimer } from '../../hooks/useInactivityTimer';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ENDPOINTS, SETTINGS, USER_ROLES } from '../../types/constants';
import { getAuthMe } from '../../services/authService';
import { apiRequest } from '../../services/apiRequest';

const requestCache = new Map<string, Promise<AdminUser>>();

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { setUser, loggedInUserId, setLoggedInUserId } =
    useContext(UserContext);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();
  const { snackbarState, showSnackbar, handleClose } = useSnackbar();

  // Add inactivity timer
  const resetTimer = useInactivityTimer({
    onInactivity: () => {
      localStorage.clear();
      window.location.href =
        '/.auth/logout?post_logout_redirect_uri=/login.html';
    },
    timeout: SETTINGS.inactivity_timeout,
  });

  useEffect(() => {
    const fetchTokenAndRole = async () => {
      try {
        const payload = await getAuthMe();
        const { clientPrincipal } = payload;
        const userClaims = clientPrincipal;
        setUser(userClaims || null);

        if (userClaims?.userRoles?.includes('volunteer') && !loggedInUserId) {
          navigate('/pick-your-name');
          return;
        }

        if (userClaims?.userRoles?.includes('admin')) {
          const createdOrUpdatedAdmin = await upsertAdminUser({
            name: userClaims.userDetails ?? '',
            email: userClaims.userId ?? '',
            claims: userClaims,
          });
          // Now we have an User object with id, name, created_at, last_signed_in
          setLoggedInUserId(createdOrUpdatedAdmin.id);
        }
      } catch (error) {
        console.error('Error in fetchTokenAndVolunteers:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate user';
        showSnackbar(`Authentication error: ${errorMessage}`, 'error');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };
    fetchTokenAndRole();

    // The effect is intended to run only once on mount.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  /**
   * Create or update an Admin entry in the "Users" table:
   *  - Check if the admin already exists (by email).
   *  - If it exists, update the last_signed_in field and return the updated record.
   *  - Otherwise, insert a new admin record and return it.
   */
  const upsertAdminUser = async (adminInfo: {
    name: string;
    email: string;
    claims: NonNullable<ReturnType<typeof Object.create>>;
  }): Promise<User> => {
    const cacheKey = adminInfo.email;

    // Prevent duplicate requests using a cache
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey)!;
    }

    // Query whether this user already exists by email
    const promise = (async () => {
      try {
        const escapedEmail = adminInfo.email.replace(/'/g, "''");
        const filterUrl = `${ENDPOINTS.USERS}?$filter=${encodeURIComponent(`email eq '${escapedEmail}'`)}`;

        const usersResponse = await apiRequest<User[]>({
          url: filterUrl,
          role: USER_ROLES.ADMIN,
        });
        const users = usersResponse.value;

        // If there's an existing record, update last_signed_in
        if (users && users.length > 0) {
          const userId = users[0].id;

          await apiRequest({
            url: `${ENDPOINTS.USERS}/id/${userId}`,
            role: USER_ROLES.ADMIN,
            method: 'PATCH',
            body: { last_signed_in: new Date().toISOString() },
          });

          // Re-fetch updated record to ensure it reflects the latest state
          const updatedUrl = `${ENDPOINTS.USERS}?$filter=${encodeURIComponent(`id eq ${userId}`)}`;
          const updatedResponse = await apiRequest<User[]>({
            url: updatedUrl,
            role: USER_ROLES.ADMIN,
          });
          const updated = updatedResponse.value;

          if (!updated || updated.length === 0) {
            throw new Error(`User with id ${userId} not found after update`);
          }
          return updated[0] as AdminUser;
        } else {
          // No record found, create a new admin entry
          const result = await apiRequest<User[]>({
            url: ENDPOINTS.USERS,
            role: USER_ROLES.ADMIN,
            method: 'POST',
            body: {
              name: adminInfo.name,
              email: adminInfo.email,
              role: 'admin',
              active: true,
              created_at: new Date().toISOString(),
              last_signed_in: new Date().toISOString(),
            },
          });

          if (Array.isArray(result.value)) {
            if (result.value.length != 1) {
              throw new Error('Create admin did not return exactly one record');
            }
            return result.value[0] as AdminUser;
          }
          throw new Error('Create admin returned an unexpected error.');
        }
      } finally {
        requestCache.delete(cacheKey);
      }
    })();

    requestCache.set(cacheKey, promise);
    return promise;
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // set media wise responsive drawer
  useEffect(() => {
    setDrawerOpen(!matchDownLG);
  }, [matchDownLG]);

  return (
    <DrawerOpenContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      <ScrollTop>
        <Box
          sx={{ display: 'flex', width: '100%' }}
          onMouseMove={resetTimer}
          onClick={resetTimer}
          onKeyPress={resetTimer}
        >
          <Header open={drawerOpen} handleDrawerToggle={handleDrawerToggle} />
          <Drawer open={drawerOpen} handleDrawerToggle={handleDrawerToggle} />
          <Box
            component="main"
            sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 } }}
          >
            <Toolbar />
            <Breadcrumbs navigation={navigation} title />
            <Outlet context={{ drawerOpen }} />
          </Box>
        </Box>
        <SnackbarAlert
          open={snackbarState.open}
          onClose={handleClose}
          severity={snackbarState.severity}
        >
          {snackbarState.message}
        </SnackbarAlert>
      </ScrollTop>
    </DrawerOpenContext.Provider>
  );
};

export default MainLayout;
