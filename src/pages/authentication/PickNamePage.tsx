/**
 *  PickNamePage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Autocomplete,
  TextField,
  Box
} from '@mui/material';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import CenteredLayout from './CenteredLayout';
import SnackbarAlert from '../../components/SnackbarAlert';
import { UserContext } from '../../components/contexts/UserContext';
import { User } from '../../types/interfaces';
import { apiRequest } from '../../services/apiRequest';
import { ENDPOINTS, USER_ROLES } from '../../types/constants';
import { trackException } from '../../utils/appInsights';
import { useSnackbar } from '../../hooks/useSnackbar';

const PickYourNamePage: React.FC = () => {
  const { user, loggedInUserId, setLoggedInUserId, activeVolunteers, setActiveVolunteers, setPinVerified } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { snackbarState, showSnackbar, handleClose } = useSnackbar();

  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUserId(null);
    setPinVerified(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchVolunteers = async () => {
      try {
        setIsLoading(true);
        const url = `${ENDPOINTS.USERS}?$select=id,name&$filter=active eq true and role eq 'volunteer'`
        const data = await apiRequest<User[]>({
          url,
          role: USER_ROLES.VOLUNTEER,
        });
        setActiveVolunteers(data.value);
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Unknown error fetching volunteers');
        console.error('Failed to fetch volunteers:', error);
        trackException(err, {
          component: 'PickNamePage',
          action: 'fetchVolunteers',
        });
        showSnackbar('Failed to load volunteer list. Please try again later.', 'warning');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVolunteers();
    // The effect is intended to run only once on mount.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  },[]);

  const handleNameChange = (
    _event: React.SyntheticEvent,
    value: User | null,
  ) => {
    setLoggedInUserId(value?.id ?? null);
  };

  const handleNextClick = () => {
    if (loggedInUserId) {
      navigate('/enter-your-pin');
    } else {
      showSnackbar('Please select a name before continuing.', 'warning');
    }
  };

  const isValidVolunteer = (volunteerId: number | null): boolean =>
    volunteerId !== null && activeVolunteers.some((v) => v.id === volunteerId);

  return (
      <MinimalWrapper>
        <CenteredLayout>
          <Box sx={{ maxWidth: '340px', width: '100%' }}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'left',
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
              <strong>Can't find your name?</strong> Let a staff member know.
            </Typography>

            <Autocomplete
              data-testid="volunteer-name-autocomplete"
              value={activeVolunteers.find(volunteer => volunteer.id === loggedInUserId) || null}
              onChange={handleNameChange}
              options={activeVolunteers}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={isLoading ? 'Loading...' : 'Select your name'}
                  variant="outlined"
                  sx={{ width: '100%' }}
                />
              )}
              sx={{
                width: '100%',
                marginBottom: 4,
                '& .MuiAutocomplete-inputRoot': { height: '56px' },
              }}
              disabled={isLoading}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleNextClick}
              disabled={isLoading || !loggedInUserId || !isValidVolunteer(loggedInUserId)}
              sx={{ height: '56px' }}
            >
              Continue
            </Button>
          </Box>

          <SnackbarAlert
            open={snackbarState.open}
            onClose={handleClose}
            severity={snackbarState.severity}
          >
            {snackbarState.message}
          </SnackbarAlert>
        </CenteredLayout>
      </MinimalWrapper>
  );
};

export default PickYourNamePage;
