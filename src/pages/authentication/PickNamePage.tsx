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
import SpinUpDialog from './SpinUpDialog';
import { fetchWithRetry } from '../../components/fetchWithRetry';
import { ENDPOINTS, USER_ROLES } from '../../types/constants';

const PickYourNamePage: React.FC = () => {
  const { user, loggedInUserId, setLoggedInUserId, activeVolunteers, setActiveVolunteers } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning';
  }>({ open: false, message: '', severity: 'warning' });
  const [retryCount, setRetryCount] = useState(0);
  const [showSpinUpDialog, setShowSpinUpDialog] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const fetchVolunteers = async () => {
      try {
        setIsLoading(true);
        const url = `${ENDPOINTS.USERS}?$select=id,name&$filter=active eq true and role eq 'volunteer'`
        const data = await fetchWithRetry<User[]>({
          url, 
          role: USER_ROLES.VOLUNTEER,
          setShowSpinUpDialog,
          setRetryCount
        });
        setActiveVolunteers(data.value);
      } catch (error) {
        console.error('Failed to fetch volunteers:', error);
        setSnackbarState({
          open: true,
          message: 'Failed to load volunteer list. Please try again later.',
          severity: 'warning',
        });
      } finally {
        setIsLoading(false);
        setShowSpinUpDialog(false);
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
      setSnackbarState({
        open: true,
        message: 'Please select a name before continuing.',
        severity: 'warning',
      });
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  return (
      <MinimalWrapper>
        <CenteredLayout>
          <Box sx={{ maxWidth: '250px', minWidth: '250px', width: '100%' }}>
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
                marginBottom: 8,
                '& .MuiAutocomplete-inputRoot': { height: '56px' },
              }}
              disabled={isLoading}
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
              disabled={isLoading}
            >
              Continue
            </Button>
          </Box>

          <SnackbarAlert
            open={snackbarState.open}
            onClose={handleSnackbarClose}
            severity={snackbarState.severity}
          >
            {snackbarState.message}
          </SnackbarAlert>
        </CenteredLayout>
        <SpinUpDialog open={showSpinUpDialog} retryCount={retryCount} />
      </MinimalWrapper>
  );
};

export default PickYourNamePage;
