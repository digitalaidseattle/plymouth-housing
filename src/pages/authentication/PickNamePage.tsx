import React, { useState } from 'react';
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
import VolunteerNames from '../../data/volunteers';



//TODO: Implement the fetch logic to get the names from the server

const PickYourNamePage: React.FC = () => {
  const [selectedName, setSelectedName] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleNameChange = (
    _event: React.ChangeEvent<{}>,
    value: string | null,
  ) => {
    setSelectedName(value || '');
  };

  const handleNextClick = () => {
    if (selectedName) {
      navigate('/enter-your-pin');
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
            value={selectedName}
            onChange={handleNameChange}
            options={VolunteerNames}
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
            color="secondary"
            onClick={handleNextClick}
            sx={{
              height: '45px',
              width: '100%',
              fontSize: '16px',
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
