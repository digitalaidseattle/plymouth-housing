import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Stack, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Logo from '../../components/Logo/Logo';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import CenteredCard from '../../layout/MinimalLayout/CenteredCard';
import PinInput from '../../pages/authentication/PinInput';

const EnterPinPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const handleNextClick = () => {
      navigate('/');
    }
  const handlePrevClick = () => {
      navigate('/pick-your-name');
    }

  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  return (
    <MinimalWrapper>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Grid item xs={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Logo />
            <Typography variant="h5">{import.meta.env.VITE_APPLICATION_NAME}</Typography>
          </Stack>
        </Grid>
        <CenteredCard>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
                <Typography variant="h3" textAlign="center">Enter Your PIN</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="column" justifyContent="center" alignItems="center">
                <PinInput/>
                <Typography
                  variant="body2"
                  color="primary"
                  onClick={handleDialogOpen}
                  sx={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  I forgot my password
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handlePrevClick}>
                  Previous
                </Button>
                <Button variant="contained" color="primary" onClick={handleNextClick}>
                  Next
              </Button>
              </Stack>
            </Grid>
          </Grid>
        </CenteredCard>
      </Grid>
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography>
            Please enter your personal email address to reset your password.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDialogClose} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </MinimalWrapper>
  );
};

export default EnterPinPage;