import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import PinInput from './PinInput';
import CenteredLayout from './CenteredLayout';
import SnackbarAlert from './SnackbarAlert';

const EnterPinPage: React.FC = () => {
  const [pin, setPin] = useState<string[]>(() => Array(4).fill(''));
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleNextClick = () => {
    if (pin.every((p) => p !== '')) {
      //TODO: Implement the logic to check the PIN
      navigate('/');
    }
    setOpenSnackbar(true);
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
            variant="h3"
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
            color="secondary"
            onClick={handleNextClick}
            sx={{
              height: '45px',
              width: '100%',
              fontSize: '16px',
              marginTop: 2,
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
          severity="warning"
        >
          Please enter your PIN before continuing.
        </SnackbarAlert>
      </CenteredLayout>
    </MinimalWrapper>
  );
};

export default EnterPinPage;
