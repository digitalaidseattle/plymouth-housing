import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import PinInput from './PinInput';
import CenteredLayout from './CenteredLayout';
import SnackbarAlert from './SnackbarAlert';
import { ENDPOINTS, HEADERS } from '../../types/constants';

const EnterPinPage: React.FC = () => {
  const [pin, setPin] = useState<string[]>(() => Array(4).fill(''));
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'warning'
  >('warning');
  const location = useLocation();
  const { volunteerId, role, volunteers } = location.state || {};
  const navigate = useNavigate();

  if (!volunteerId) {
    navigate('/pick-your-name');
  }

  const verifyPin = async (id: number, enteredPin: string) => {
    try {
      HEADERS['X-MS-API-ROLE'] = role;
      const response = await fetch(ENDPOINTS.VERIFY_PIN, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          VolunteerId: id,
          EnteredPin: enteredPin,
          IsValid: null,
          ErrorMessage: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify PIN.');
      }

      const data = await response.json();
      const result = data.value[0]; // Get the result from the response

      return result;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setSnackbarMessage('Failed to verify PIN. Please try again.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return null;
    }
  };

  const updateLastSignedIn = async (id: number) => {
    try {
      HEADERS['X-MS-API-ROLE'] = role;
      const response = await fetch(`${ENDPOINTS.USERS}/id/${id}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ last_signed_in: new Date().toISOString() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update last signed in.');
      }
    } catch (error) {
      console.error('Error updating last signed in:', error);
    }
  };

  const handleNextClick = async () => {
    if (pin.every((p) => p !== '')) {
      const enteredPin = pin.join(''); // Combine array into a single string (e.g., '1234')
      const result = await verifyPin(volunteerId, enteredPin);

      if (result?.IsValid) {
        setSnackbarMessage('Login successful! Redirecting...');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        await updateLastSignedIn(volunteerId); // Update last signed-in date after successful login
        navigate('/volunteer-home', {
          state: { volunteerId: volunteerId, volunteers: volunteers },
        });
      } else {
        setSnackbarMessage(
          result?.ErrorMessage || 'Incorrect PIN. Please try again.',
        );
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
      }
    } else {
      setSnackbarMessage('Please enter your PIN before continuing.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
    }
  };

  const handlePreviousClick = () => {
    navigate('/pick-your-name');
  };

  const handlePinChange = useCallback((newPin: string[]) => {
    setPin(newPin);
  }, []);

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
            Enter Your PIN.
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
            <strong>Forget your pin?</strong> Contact IT department at{' '}
            {import.meta.env.VITE_ADMIN_PHONE_NUMBER} or{' '}
            {import.meta.env.VITE_ADMIN_EMAIL}
          </Typography>
          <Box sx={{ marginBottom: 6 }}>
            <PinInput onPinChange={handlePinChange} />
          </Box>

          <Button
            variant="contained"
            onClick={handleNextClick}
            sx={{
              height: '45px',
              width: '100%',
              fontSize: '16px',
              backgroundColor: 'black',
              color: 'white',
              marginTop: 2,
              '&:hover': {
                backgroundColor: '#4f4f4f',
              },
            }}
          >
            Continue
          </Button>
          <Typography
            variant="body2"
            onClick={handlePreviousClick}
            sx={{
              cursor: 'pointer',
              textAlign: 'center',
              marginTop: 2,
              textDecoration: 'underline',
            }}
          >
            Back to the name selection.
          </Typography>
        </Box>
        <SnackbarAlert
          open={openSnackbar}
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </SnackbarAlert>
      </CenteredLayout>
    </MinimalWrapper>
  );
};

export default EnterPinPage;
