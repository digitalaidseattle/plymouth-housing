/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Button, Stack } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AddIcon from '@mui/icons-material/Add';
import SnackbarAlert from '../../components/SnackbarAlert.tsx';

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ icon, title, subtitle }) => {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {icon}
      <Box>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
};

// Colour comes from the theme's MuiButton `contained` override. Fixed height,
// not flex, so both cards stay level when one subtitle wraps to two lines.
const buttonSx = {
  minHeight: 160,
  flexDirection: 'column',
  gap: 1,
  borderRadius: 4,
};

const VolunteerHome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    <Box
      sx={{
        paddingX: { xs: 2, sm: 4, md: 20 },
        paddingY: 2,
        height: '75vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h4" sx={{ mb: 5 }}>
        Thanks for being here! Let's make a difference.
      </Typography>

      {/* Centring sits here, not on the Stack, which needs alignItems:
          'stretch' to keep the cards level. */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={6}
          sx={{ width: '100%', alignItems: 'stretch' }}
        >
          {/* Checkout Section */}
          <Stack
            data-testid="section-checkout"
            spacing={3}
            sx={{ flex: 1, justifyContent: 'space-between' }}
          >
            <SectionHeader
              icon={<ArrowUpwardIcon />}
              title="Checkout"
              subtitle="Give items to resident"
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCheckOutClick}
              sx={buttonSx}
            >
              <ShoppingCartOutlinedIcon />
              <Typography variant="h5">Check out</Typography>
            </Button>
          </Stack>

          {/* Inventory Section */}
          <Stack
            data-testid="section-inventory"
            spacing={3}
            sx={{ flex: 1, justifyContent: 'space-between' }}
          >
            <SectionHeader
              icon={<ArrowDownwardIcon />}
              title="Inventory"
              subtitle="Add donated or purchased items"
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleRestockClick}
              sx={buttonSx}
            >
              <AddIcon />
              <Typography variant="h5">Add item</Typography>
            </Button>
          </Stack>
        </Stack>
      </Box>

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
