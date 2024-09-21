import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack } from '@mui/material';
import Logo from '../../components/Logo/Logo';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import PinInput from './PinInput';
import CenteredLayout from './CenteredLayout';
import ContactAdminDialog from './ContactAdminDialog';
import SnackbarAlert from './SnackbarAlert';

const EnterPinPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
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

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
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
        <Stack direction="row" spacing={1} alignItems="center">
          <Logo />
          <Typography variant="h5">
            {import.meta.env.VITE_APPLICATION_NAME}
          </Typography>
        </Stack>
        <Typography
          variant="h3"
          textAlign="center"
          sx={{
            height: '50px',
            lineHeight: '50px',
            marginBottom: 2,
          }}
        >
          Enter Your PIN.
        </Typography>
        <PinInput onPinChange={handlePinChange} />
        <Typography
          variant="body2"
          color="primary"
          onClick={handleDialogOpen}
          sx={{
            cursor: 'pointer',
            textAlign: 'center',
            marginTop: 6,
            paddingTop: '3.66px',
          }}
        >
          I forgot my password.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleNextClick}
          sx={{
            height: '45px',
            width: '200px',
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

        <ContactAdminDialog open={openDialog} onClose={handleDialogClose} />

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
