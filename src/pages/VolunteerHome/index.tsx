/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Stack } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
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
  // Success/cancel message from CheckoutPage; absent on a plain visit.
  const navState = location.state as { message?: string } | null;
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning';
  }>({
    open: Boolean(navState?.message),
    message: navState?.message ?? '',
    severity: 'success',
  });

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarState({ ...snackbarState, open: false });
  };

  const handleCheckOutClick = () => {
    navigate('/checkout', { state: { checkoutType: 'general' } });
  };

  const handleRestockClick = () => {
    navigate('/inventory', {
      state: { inventoryType: 'General', openAddModal: true },
    });
  };

  return (
    <Box sx={{ paddingX: { xs: 2, sm: 4, md: 20 }, paddingY: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {today}
      </Typography>

      <Typography variant="h4" sx={{ mt: 1, fontWeight: 400 }}>
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
            onClick={handleRestockClick}
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
