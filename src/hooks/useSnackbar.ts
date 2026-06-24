/**
 *  useSnackbar.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useCallback } from 'react';
import { SnackbarState } from '../types/interfaces';

export function useSnackbar() {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'warning',
  });

  const showSnackbar = useCallback((message: string, severity: SnackbarState['severity'] = 'error') => {
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
