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
import { Admin } from '../../types/interfaces';
import { ENDPOINTS, HEADERS } from '../../types/constants';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { setUser, loggedInVolunteerId, activeVolunteers, setLoggedInAdmin } = useContext(UserContext);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTokenAndVolunteers = async () => {
      const response = await fetch('/.auth/me');
      const payload = await response.json();
      const { clientPrincipal } = payload;

      try {
        const userClaims = clientPrincipal;
        setUser(userClaims || null);

        // If volunteer logic applies (we might have a list of volunteers)
        if (userClaims.userRoles?.includes('volunteer') && !loggedInVolunteerId) {
          navigate('/pick-your-name');
          return;
        }

        // If the user's role is 'Admin', handle admin-specific logic
        if (userClaims?.userRoles?.includes('admin')) {
          HEADERS['X-MS-API-ROLE'] = 'admin';
          try {
            // Create or update the admin record in the database
            const createdOrUpdatedAdmin = await upsertAdminUser({
              name: userClaims.name ?? '',
              email: userClaims.email ?? ''
            });
            // Now we have an Admin object with id, name, created_at, last_signed_in
            setLoggedInAdmin(createdOrUpdatedAdmin);
          } catch (error) {
            console.error('Error in upsertAdminUser:', error);
            //TODO error handling
          }
        }
      } catch (error) {
        console.error('Error in fetchTokenAndVolunteers:', error);
        navigate('/login');
      }
    };
    fetchTokenAndVolunteers();
  }, [navigate, loggedInVolunteerId, activeVolunteers, activeVolunteers, setUser, setLoggedInAdmin]);

  /**
   * Create or update an Admin entry in the "Users" table:
   *  - Check if the admin already exists (by email).
   *  - If it exists, update the last_signed_in field and return the updated record.
   *  - Otherwise, insert a new admin record and return it.
   */
  const upsertAdminUser = async (adminInfo: { name: string; email: string }): Promise<Admin> => {
    // Step 1: Query whether this user already exists by email
    const getResp = await fetch(`${ENDPOINTS.USERS}?$filter=email eq '${adminInfo.email}'`, {
      method: 'GET',
      headers: HEADERS,
    });
    if (!getResp.ok) {
      throw new Error(`Failed to query user: ${getResp.statusText}`);
    }
    const getData = await getResp.json();

    // If there's an existing record, update last_signed_in
    if (getData.value && getData.value.length > 0) {
      const userRecord = getData.value[0]; // e.g. { id, name, email, created_at, last_signed_in, ... }
      const userId = userRecord.id;

      const patchResp = await fetch(`${ENDPOINTS.USERS}/id/${userId}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ last_signed_in: new Date().toISOString() }),
      });
      if (!patchResp.ok) {
        throw new Error(`Failed to patch user: ${patchResp.statusText}`);
      }

      // For convenience, you could re-GET or parse patchResp body if Data API Builder returns updated info.
      // Let's assume we do a second GET to get the latest record:
      const updatedRecordResp = await fetch(`${ENDPOINTS.USERS}?$filter=id eq ${userId}`, {
        method: 'GET',
        headers: HEADERS,
      });
      if (!updatedRecordResp.ok) {
        throw new Error(`Failed to retrieve updated admin record: ${updatedRecordResp.statusText}`);
      }
      const updatedData = await updatedRecordResp.json();
      const updated = updatedData.value[0];

      // Return an Admin object matching { id, name, created_at, last_signed_in }
      return {
        id: updated.id,
        name: updated.name,
        created_at: updated.created_at,
        last_signed_in: updated.last_signed_in
      };

    } else {
      // No record found, create a new admin entry
      const createResp = await fetch(ENDPOINTS.USERS, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          name: adminInfo.name,
          email: adminInfo.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          last_signed_in: new Date().toISOString(),
        })
      });
      if (!createResp.ok) {
        throw new Error(`Failed to create admin user: ${createResp.statusText}`);
      }
      // parse created record from response
      const createdRecord = await createResp.json();
      const result = createdRecord.value ? createdRecord.value[0] : createdRecord;

      return {
        id: result.id,
        name: result.name,
        created_at: result.created_at,
        last_signed_in: result.last_signed_in
      };
    }
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
    </DrawerOpenContext.Provider>
)}

export default MainLayout;
