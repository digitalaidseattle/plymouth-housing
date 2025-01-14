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
import { RefreshContextProvider } from '../../components/contexts/RefreshContextProvider';
import { UserContext } from '../../components/contexts/UserContext';
import { useMsal } from '@azure/msal-react';
import { IdTokenClaims } from '@azure/msal-common';
import { Volunteer, Admin } from '../../types/interfaces';
import { ENDPOINTS, HEADERS } from '../../types/constants';
// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const [user, setUser] = useState<IdTokenClaims | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [loggedInVolunteer, setLoggedInVolunteer] = useState<Volunteer | null>(
    null,
  );
  const [activeVolunteers, setActiveVolunteers] = useState<Volunteer[]>([]);
  const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);
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

       // If volunteer logic applies (we might have a list of volunteers)
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
      // If the user's role is 'Admin', handle admin-specific logic
      if (userClaims?.roles?.[0] === 'admin') {
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
  }, [instance, navigate, volunteerId, volunteers, activeVolunteers.length]);

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
    <UserContext.Provider
      value={{
        user,
        setUser,
        loggedInVolunteer: loggedInVolunteer,
        setLoggedInVolunteer: setLoggedInVolunteer,
        activeVolunteers: activeVolunteers,
        setActiveVolunteers: setActiveVolunteers,
        loggedInAdmin: loggedInAdmin,
        setLoggedInAdmin: setLoggedInAdmin,
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
