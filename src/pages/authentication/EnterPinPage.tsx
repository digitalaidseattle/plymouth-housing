/**
 *  pages/authentication/EnterPinPage.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import PinInput from './PinInput';
import CenteredLayout from './CenteredLayout';
import SnackbarAlert from '../../components/SnackbarAlert';
import { ENDPOINTS, HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../../components/contexts/UserContext';

const EnterPinPage: React.FC = () => {
  const [pin, setPin] = useState<string[]>(() => Array(4).fill(''));
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' >('warning');
  const { loggedInUserId, user } = useContext(UserContext);
  const navigate = useNavigate();

  if (!loggedInUserId) {
    navigate('/pick-your-name');
  }

  const handleTheSnackies = (message: string, severity: 'success' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  }

  const verifyPin = async (id: number, enteredPin: string) => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
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
      handleTheSnackies('Failed to verify PIN. Please try again.', 'warning');
      return null;
    }
  };

  const updateLastSignedIn = async (id: number) => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
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
      let result = null;
      if (loggedInUserId !== null) {
        result = await verifyPin(loggedInUserId, enteredPin);
      } else {
        handleTheSnackies('Volunteer ID is missing. Please try again.', 'warning');
      }

      if (result?.IsValid) {
        handleTheSnackies('Login successful! Redirecting...', 'success');
        if (loggedInUserId !== null) {
          result = await updateLastSignedIn(loggedInUserId); // Update last signed-in date after successful login
        }
        navigate('/volunteer-home');
      } else {
        setSnackbarMessage(
          result?.ErrorMessage || 'Incorrect PIN. Please try again.',
        );
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);

        handleTheSnackies(result?.ErrorMessage || 'Incorrect PIN. Please try again.', 'warning');
      }
    } else {
      handleTheSnackies('Please enter your PIN before continuing.', 'warning');
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
