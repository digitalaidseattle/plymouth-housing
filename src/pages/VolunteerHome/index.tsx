/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Stack } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useSnackbar } from '../../hooks/useSnackbar';
import SnackbarAlert from '../../components/SnackbarAlert.tsx';
import ActionCard from './ActionCard.tsx';

const VolunteerHome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const {
    snackbarState,
    showSnackbar,
    handleClose: handleSnackbarClose,
  } = useSnackbar();

  // Success/cancel message from CheckoutPage; absent on a plain visit.
  useEffect(() => {
    if (location.state?.message) {
      showSnackbar(location.state.message, 'success');
    }
  }, [location.state, showSnackbar]);

  const handleCheckOutClick = () => {
    navigate('/checkout', { state: { checkoutType: 'general' } });
  };

  const handleAddStockClick = () => {
    navigate('/inventory', {
      state: { inventoryType: 'General', openAddModal: true },
    });
  };

  return (
    <Box sx={{ paddingX: { xs: 2, sm: 4, md: 20 }, paddingY: 2 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {today}
      </Typography>

      <Typography variant="h4" sx={{ mt: 1, fontWeight: 'fontWeightRegular' }}>
        Thanks for being here!
        <br />
        Let's make a difference.
      </Typography>

      <Typography variant="h6" sx={{ mt: 12, mb: 2 }}>
        General Inventory
      </Typography>

      {/* Row from `sm` (768px) so the cards stay side by side on tablet portrait. */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        {/* Test ids sit on the wrappers: `within()` excludes its own container. */}
        <Box data-testid="section-checkout" sx={{ flex: 1, display: 'flex' }}>
          <ActionCard
            icon={<ShoppingCartOutlinedIcon />}
            title="Check out"
            subtitle="Give items to resident"
            onClick={handleCheckOutClick}
          />
        </Box>
        <Box data-testid="section-inventory" sx={{ flex: 1, display: 'flex' }}>
          <ActionCard
            icon={<Inventory2OutlinedIcon />}
            title="Add stock"
            subtitle="Add items to inventory"
            onClick={handleAddStockClick}
          />
        </Box>
      </Stack>

      <SnackbarAlert
        open={snackbarState.open}
        onClose={handleSnackbarClose}
        severity={snackbarState.severity}
      >
        {snackbarState.message}
      </SnackbarAlert>
    </Box>
  );
};

export default VolunteerHome;
