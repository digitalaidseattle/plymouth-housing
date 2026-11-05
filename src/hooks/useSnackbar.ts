/**
 *  useSnackbar.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useCallback, useEffect } from 'react';
import type { AlertColor } from '@mui/material';

type SnackbarSeverity = AlertColor;

interface SnackbarMessage {
  message: string;
  severity: SnackbarSeverity;
}

interface SnackbarState extends SnackbarMessage {
  open: boolean;
}

interface SnackbarQueueState extends SnackbarState {
  queue: SnackbarMessage[];
}

const NEXT_MESSAGE_DELAY_MS = 200;

export function useSnackbar() {
  const [state, setState] = useState<SnackbarQueueState>({
    open: false,
    message: '',
    severity: 'warning',
    queue: [],
  });

  const showSnackbar = useCallback((message: string, severity: SnackbarSeverity = 'error') => {
    setState((prev) =>
      prev.open || prev.queue.length > 0
        ? { ...prev, queue: [...prev.queue, { message, severity }] }
        : { ...prev, open: true, message, severity },
    );
  }, []);

  const handleClose = useCallback((
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    if (state.open || state.queue.length === 0) return;
    const timer = setTimeout(() => {
      setState((prev) => {
        if (prev.open || prev.queue.length === 0) return prev;
        const [next, ...rest] = prev.queue;
        return { open: true, ...next, queue: rest };
      });
    }, NEXT_MESSAGE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.open, state.queue]);

  const snackbarState: SnackbarState = {
    open: state.open,
    message: state.message,
    severity: state.severity,
  };

  return {
    snackbarState,
    showSnackbar,
    handleClose,
  };
}
