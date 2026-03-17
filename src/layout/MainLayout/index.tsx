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
import { DrawerOpenContext } from '../../components/contexts/DrawerOpenContext';
import { UserContext } from '../../components/contexts/UserContext';
import { AdminUser, User } from '../../types/interfaces';
import { useInactivityTimer } from '../../hooks/useInactivityTimer';
import { API_HEADERS, ENDPOINTS, SETTINGS, USER_ROLES } from '../../types/constants';
import SpinUpDialog from '../../pages/authentication/SpinUpDialog';
import { getAuthMe } from '../../services/authService';
import { fetchWithRetry } from '../../services/fetchWithRetry';

const requestCache = new Map<string, Promise<AdminUser>>();

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { setUser, loggedInUserId, setLoggedInUserId } =
    useContext(UserContext);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showSpinUpDialog, setShowSpinUpDialog] = useState(false);
  const navigate = useNavigate();

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
          try {
            const createdOrUpdatedAdmin = await upsertAdminUser({
              name: userClaims.userDetails ?? '',
              email: userClaims.userID ?? '',
              claims: userClaims,
            });
            // Now we have an User object with id, name, created_at, last_signed_in
            setLoggedInUserId(createdOrUpdatedAdmin.id);
          } catch (error) {
            console.error('Error in upsertAdminUser:', error);
            //TODO error handling
          }
        }
      } catch (error) {
        console.error('Error in fetchTokenAndVolunteers:', error);
        navigate('/');
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

        const usersResponse = await fetchWithRetry<User[]>({
          url: filterUrl,
          role: USER_ROLES.ADMIN,
          setShowSpinUpDialog,
          setRetryCount,
        });
        const users = usersResponse.value;

        // If there's an existing record, update last_signed_in
        if (users && users.length > 0) {
          const userId = users[0].id;

          // PATCH request for update (not using fetchWithRetry as it only supports GET)
          const headers = { ...API_HEADERS, 'X-MS-API-ROLE': USER_ROLES.ADMIN };
          const updateResponse = await fetch(`${ENDPOINTS.USERS}/id/${userId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ last_signed_in: new Date().toISOString() }),
          });

          if (!updateResponse.ok) {
            throw new Error(`Failed to update user: ${updateResponse.statusText}`);
          }

          // Re-fetch updated record to ensure it reflects the latest state
          const updatedUrl = `${ENDPOINTS.USERS}?$filter=${encodeURIComponent(`id eq ${userId}`)}`;
          const updatedResponse = await fetchWithRetry<User[]>({
            url: updatedUrl,
            role: USER_ROLES.ADMIN,
            setShowSpinUpDialog,
            setRetryCount,
          });
          const updated = updatedResponse.value;

          if (!updated || updated.length === 0) {
            throw new Error(`User with id ${userId} not found after update`);
          }
          return updated[0] as AdminUser;
        } else {
          // No record found, create a new admin entry
          // POST request for create (not using fetchWithRetry as it only supports GET)
          const headers = { ...API_HEADERS, 'X-MS-API-ROLE': USER_ROLES.ADMIN };
          const createResponse = await fetch(ENDPOINTS.USERS, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              name: adminInfo.name,
              email: adminInfo.email,
              role: 'admin',
              active: true,
              created_at: new Date().toISOString(),
              last_signed_in: new Date().toISOString(),
            }),
          });

          if (!createResponse.ok) {
            throw new Error(`Failed to create user: ${createResponse.statusText}`);
          }

          const result = await createResponse.json();
          if (Array.isArray(result.value)) {
            if (result.value.length === 0) {
              throw new Error('Create user returned no records');
            }
            return result.value[0] as AdminUser;
          }
          return result as AdminUser;
        }
      } finally {
        requestCache.delete(cacheKey);
        setShowSpinUpDialog(false);
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
      </ScrollTop>
      <SpinUpDialog open={showSpinUpDialog} retryCount={retryCount} />
    </DrawerOpenContext.Provider>
  );
};

export default MainLayout;
