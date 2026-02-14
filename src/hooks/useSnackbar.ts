import { useState, useCallback } from 'react';

type SnackbarSeverity = 'success' | 'warning' | 'error';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

export function useSnackbar() {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'warning',
  });

  const showSnackbar = useCallback((message: string, severity: SnackbarSeverity = 'error') => {
    setSnackbarState({ open: true, message, severity });
  }, []);

  const handleClose = useCallback((
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    snackbarState,
    showSnackbar,
    handleClose,
  };
}
