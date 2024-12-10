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

const API = '/data-api/rest/volunteer';
const HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=utf-8',
};

interface Volunteer {
  id: number;
  name: string;
}

const PickYourNamePage: React.FC = () => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning';
  }>({ open: false, message: '', severity: 'warning' });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `${API}?$select=id,name&$filter=active eq true`,
          {
            method: 'GET',
            headers: HEADERS,
          },
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch volunteers: ${response.statusText}`);
        }

        const data = await response.json();

        setVolunteers(data.value);
      } catch (error) {
        console.error('Failed to fetch volunteers:', error);
        setSnackbarState({
          open: true,
          message: 'Failed to load volunteer list. Please try again later.',
          severity: 'warning'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

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
        state: { volunteerId: selectedVolunteer.id },
      });
    } else {
      setSnackbarState({
        open: true,
        message: 'Please select a name before continuing.',
        severity: 'warning'
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
    setSnackbarState(prev => ({ ...prev, open: false }));
  };

  return (
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
                label={isLoading ? "Loading..." : "Select your name"}
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
    </MinimalWrapper>
  );
};

export default PickYourNamePage;