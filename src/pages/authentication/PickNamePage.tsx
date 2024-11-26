import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Autocomplete,
  TextField,
  Box,
} from '@mui/material';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import CenteredLayout from './CenteredLayout';
import SnackbarAlert from './SnackbarAlert';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS, HEADERS } from '../../types/constants'
import { Volunteer } from '../../types/interfaces';
import { IdTokenClaims } from '@azure/msal-common';
import { useMsal } from '@azure/msal-react';

const PickYourNamePage: React.FC = () => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null,
  );
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [user, setUser] = useState<IdTokenClaims | null>(null);
  const navigate = useNavigate();
  const { instance } = useMsal();

  useEffect(() => {
    const account = instance.getActiveAccount();
    if (account) {
      instance
        .acquireTokenSilent({
          account: account,
          scopes: ['openid', 'profile', 'email', 'User.Read'],
        })
        .then((response) => {
          const userClaims = response.idTokenClaims;
          setUser(userClaims || null);
        })
        .catch((error) => {
          console.error('Error acquiring token', error);
        });
    }
  }, [instance]);

  useEffect(() => {
    if (!user) return;
    const fetchVolunteers = async () => {
      try {
        HEADERS['X-MS-API-ROLE'] = getRole(user);
        const response = await fetch(
          `${ENDPOINTS.VOLUNTEERS}?$select=id,name&$filter=active eq true`,
          {
            method: 'GET',
            headers: HEADERS,
          },
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setVolunteers(data.value);
      } catch (error) {
        console.error('Failed to fetch volunteers:', error);
      }
    };
    fetchVolunteers();
  }, [user]);

  const handleNameChange = (
    _event: React.SyntheticEvent,
    value: Volunteer | null,
  ) => {
    setSelectedVolunteer(value);
  };

  const handleNextClick = () => {
    if (selectedVolunteer) {
      // Navigate to the next page, passing the volunteer ID via state
      navigate('/enter-your-pin', {
        state: { volunteerId: selectedVolunteer.id, role: getRole(user) },
      });
    } else {
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <MinimalWrapper>
        <CenteredLayout>
          <Box sx={{ maxWidth: '350px', width: '100%' }}>
            <Typography
              variant="h4"
              textAlign="left"
              sx={{
                height: '50px',
                lineHeight: '50px',
                marginBottom: 2,
              }}
            >
              Pick Your Name
            </Typography>

            <Typography
              variant="body2"
              sx={{
                maxWidth: '100%',
                textAlign: 'left',
                marginBottom: 4,
                lineHeight: 1.5,
              }}
            >
              <strong>Can't find your name?</strong> Let a staff member know or
              contact IT department at {import.meta.env.VITE_ADMIN_PHONE_NUMBER}
            </Typography>

            <Autocomplete
              value={selectedVolunteer}
              onChange={handleNameChange}
              options={volunteers}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select your name"
                  variant="outlined"
                  sx={{ width: '100%' }}
                />
              )}
              sx={{
                width: '100%',
                marginBottom: 8,
                '& .MuiAutocomplete-inputRoot': { height: '56px' },
              }}
            />

            <Button
              variant="contained"
              onClick={handleNextClick}
              sx={{
                height: '45px',
                width: '100%',
                fontSize: '16px',
                backgroundColor: 'black',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#4f4f4f',
                },
              }}
            >
              Continue
            </Button>
          </Box>

          <SnackbarAlert
            open={openSnackbar}
            onClose={handleSnackbarClose}
            severity="warning"
          >
            Please select a name before continuing.
          </SnackbarAlert>
        </CenteredLayout>
      </MinimalWrapper>
    </UserContext.Provider>
  );
};

export default PickYourNamePage;
