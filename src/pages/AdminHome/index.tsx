/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SnackbarAlert from '../../components/SnackbarAlert';
import Analytics from '../Analytics';
import { useSnackbar } from '../../hooks/useSnackbar';

const AdminHome: React.FC = () => {
  const location = useLocation();
  const { snackbarState, showSnackbar, handleClose } = useSnackbar();

  // Success/cancel message from CheckoutPage
  useEffect(() => {
    if (location.state?.message) {
      showSnackbar(
        location.state.message,
        location.state.checkoutSuccess ? 'success' : 'error',
      );
    }
  }, [location.state, showSnackbar]);

  return (
    <>
      <SnackbarAlert
        open={snackbarState.open}
        onClose={handleClose}
        severity={snackbarState.severity}
      >
        {snackbarState.message}
      </SnackbarAlert>
      <Analytics onError={showSnackbar} />
    </>
  );
};

export default AdminHome;
