import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography, Button, Autocomplete, TextField} from '@mui/material';
import Logo from '../../components/Logo/Logo';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import CenteredLayout from './CenteredLayout';
import ContactAdminDialog from './ContactAdminDialog';
import SnackbarAlert from './SnackbarAlert';

const names = ['Alice', 'Allen', 'Bob', 'Ping-Chen Chan', 'Charlie', 'David', 'Eve'];
    //TODO: Implement the fetch logic to get the names from the server

const PickYourNamePage: React.FC = () => {
  const [selectedName, setSelectedName] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleNameChange = (_event: React.ChangeEvent<{}>, value: string | null) => {
    setSelectedName(value || '');
  };

  const handleNextClick = () => {
    if (selectedName) {
      navigate('/enter-pin');
    } else {
      setOpenSnackbar(true);
    }
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
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
          <Typography variant="h5">{import.meta.env.VITE_APPLICATION_NAME}</Typography>
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
          Pick Your Name.
        </Typography>
        <Autocomplete
          value={selectedName}
          onChange={handleNameChange}
          options={names}
          renderInput={(params) => <TextField {...params} label="Select your name" variant="outlined" />}
          sx={{ minWidth: 300 }}
        />
        <Typography
          variant="body2"
          color="primary"
          onClick={handleDialogOpen}
          sx={{ cursor: 'pointer', textAlign: 'center', marginTop: 2 }}
        >
          Your name isn't listed.
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

        <ContactAdminDialog open={openDialog} onClose={handleDialogClose} />
        <SnackbarAlert open={openSnackbar} onClose={handleSnackbarClose} severity="warning">
        Please select a name before continuing.
      </SnackbarAlert>
      </CenteredLayout>
    </MinimalWrapper>
  );
};

export default PickYourNamePage;
