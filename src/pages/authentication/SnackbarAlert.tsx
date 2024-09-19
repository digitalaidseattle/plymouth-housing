import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface SnackbarAlertProps {
  open: boolean;
  onClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
  severity: 'error' | 'success' | 'info' | 'warning' | undefined;
  children: React.ReactNode;
}

const SnackbarAlert: React.FC<SnackbarAlertProps> = ({ open, onClose, severity, children }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {children}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarAlert;