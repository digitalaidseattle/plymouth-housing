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
import {VolunteerIdName} from '../../types/interfaces';

const API = '/data-api/rest/volunteer';
const HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=utf-8',
};


const PickYourNamePage: React.FC = () => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerIdName | null>(
    null,
  );
  const [volunteers, setVolunteers] = useState<VolunteerIdName[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await fetch(
          `${API}?$select=id,name&$filter=active eq true`,
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
  }, []);

  const handleNameChange =  (
    _event: React.SyntheticEvent,
    value: VolunteerIdName | null,
  ) => {
    setSelectedVolunteer(value);
  };

  const handleNextClick = () => {
    if (selectedVolunteer) {
      // Navigate to the next page, passing the volunteer ID via state
      navigate('/enter-your-pin', {
        state: { volunteerId: selectedVolunteer.id , volunteers: volunteers},
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
  );
};

export default PickYourNamePage;
