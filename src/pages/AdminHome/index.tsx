/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SnackbarAlert from '../../components/SnackbarAlert';
import Analytics from '../Analytics';
import { useSnackbar } from '../../hooks/useSnackbar';
import { UserContext } from '../../components/contexts/UserContext';
import { getCategorizedItems } from '../../services/itemsService';

const AdminHome: React.FC = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { snackbarState, showSnackbar, handleClose } = useSnackbar();

  useEffect(() => {
    if (!user) return;
    getCategorizedItems(user, true).catch((error) => {
      console.error('Error refreshing categorized items:', error);
    });
  }, [user]);

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
