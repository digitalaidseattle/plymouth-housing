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
import { RefreshContextProvider } from '../../components/contexts/RefreshContextProvider';
import { UserContext } from '../../components/contexts/UserContext';
import { AdminUser, User} from '../../types/interfaces';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { fetchWithRetry } from '../../components/fetchWithRetry';
import SpinUpDialog from '../../pages/authentication/SpinUpDialog';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { setUser, loggedInUserId, setLoggedInUserId } = useContext(UserContext);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showSpinUpDialog, setShowSpinUpDialog] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTokenAndRole = async () => {
      const response = await fetch('/.auth/me');
      const payload = await response.json();
      const { clientPrincipal } = payload;

      try {
        const userClaims = clientPrincipal;
        setUser(userClaims || null);

        if (userClaims.userRoles?.includes('volunteer') && !loggedInUserId) {
          navigate('/pick-your-name');
          return;
        }

        if (userClaims?.userRoles?.includes('admin')) {
          API_HEADERS['X-MS-API-ROLE'] = 'admin';
          try {
            const createdOrUpdatedAdmin = await upsertAdminUser({
              name: userClaims.userDetails ?? '',
              email: userClaims.userId ?? ''
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
  const requestCache = new Map<string, Promise<AdminUser>>();

  const upsertAdminUser = async (adminInfo: { name: string; email: string }): Promise<User> => {
    const cacheKey = adminInfo.email; // Use email as the unique cache key

    // Prevent duplicate requests using a cache
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey)!; // Return the cached promise if it exists
    }

    // Query whether this user already exists by email
    const promise = (async () => {
      try {
        const getData = await fetchWithRetry<User[]>({
          url: `${ENDPOINTS.USERS}?$filter=email eq '${adminInfo.email}'`,  
          role: 'admin',
          setShowSpinUpDialog,  
          setRetryCount,
        });

        // If there's an existing record, update last_signed_in
        if (getData.value && getData.value.length > 0) {
          const userRecord = getData.value[0]; // e.g. { id, name, email, created_at, last_signed_in, ... }
          const userId = userRecord.id;

          const patchResp = await fetch(`${ENDPOINTS.USERS}/id/${userId}`, {
            method: 'PATCH',
            headers: API_HEADERS,
            body: JSON.stringify({ last_signed_in: new Date().toISOString() }),
          });

          if (!patchResp.ok) {
            throw new Error(`Failed to patch user: ${patchResp.statusText}`);
          }

          // Re-fetch updated record to ensure it reflects the latest state
          const updatedRecordResp = await fetch(`${ENDPOINTS.USERS}?$filter=id eq ${userId}`, {
            method: 'GET',
            headers: API_HEADERS,
          });

          if (!updatedRecordResp.ok) {
            throw new Error(`Failed to retrieve updated admin record: ${updatedRecordResp.statusText}`);
          }

          const updatedData = await updatedRecordResp.json();
          const admin: AdminUser = updatedData.value[0];
          return admin

        } else {
          // No record found, create a new admin entry
          const createResp = await fetch(ENDPOINTS.USERS, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({
              name: adminInfo.name,
              email: adminInfo.email,
              role: 'admin',
              active: true,
              created_at: new Date().toISOString(),
              last_signed_in: new Date().toISOString(),
            }),
          });

          if (!createResp.ok) {
            throw new Error(`Failed to create admin user: ${createResp.statusText}`);
          }
          const createdRecord = await createResp.json();
          const admin = createdRecord.value ? createdRecord.value[0] : createdRecord;

          return admin
        }
      } finally {
        requestCache.delete(cacheKey); // Remove cache entry after request completion
        setShowSpinUpDialog(false);
      }
    })();

    requestCache.set(cacheKey, promise); // Cache the promise to prevent duplicate requests
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
      <SpinUpDialog open={showSpinUpDialog} retryCount={retryCount} />
    </DrawerOpenContext.Provider>
)}

export default MainLayout;
