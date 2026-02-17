import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddItemModal from '../../components/inventory/AddItemModal.tsx';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { InventoryItem } from '../../types/interfaces.ts';
import SnackbarAlert from '../../components/SnackbarAlert.tsx';

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ icon, title, subtitle }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        mb: 2,
      }}
    >
      {icon}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

const buttonSx = {
  flex: 1,
  height: '120px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  borderRadius: 5,
  borderColor: '#f5f5f5',
  color: 'black',
  '&:hover': {
    backgroundColor: '#e0e0e0',
    borderColor: '#e0e0e0',
  },
};

const VolunteerHome: React.FC = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [addModal, setAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState<InventoryItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const location = useLocation();
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning';
  }>({
    open: location.state && location.state.message.length > 0,
    message: location.state ? location.state.message : '',
    severity: 'success',
  });

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarState({ ...snackbarState, open: false });
  };

  const fetchData = useCallback(async () => {
    try {
      const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
      const response = await fetch(ENDPOINTS.EXPANDED_ITEMS + '?$first=10000', {
        headers: headers,
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setOriginalData(data.value);
    } catch (error) {
      console.error('Error fetching inventory:', error); //TODO show more meaningful error to end user.
    }
    setIsLoading(false);
  }, [user]);

  const handleAddOpen = async () => {
    await fetchData();
    setAddModal(true);
    setShowResults(false);
  };

  const handleAddClose = () => {
    setAddModal(false);
  };

  const handleCheckOutClick = (
    checkoutType: 'general' | 'welcomeBasket' = 'general',
  ) => {
    navigate('/checkout', { state: { checkoutType } });
  };

  if (isLoading) {
    return <p>Loading ...</p>;
  }

  return (
    <Box sx={{ paddingX: 20, paddingY: 2, height: '75vh' }}>
      {/* Header */}
      <Box sx={{ paddingBottom: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Thanks for being here! Let's make a difference.
        </Typography>
      </Box>

      {/* Action Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Check out Section */}
        <Box data-testid="section-checkout">
          <SectionHeader
            icon={<ArrowUpwardIcon />}
            title="Check out"
            subtitle="Give items to resident"
          />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Button
              variant="outlined"
              onClick={() => handleCheckOutClick('general')}
              sx={buttonSx}
            >
              <Typography variant="h5">General Inventory</Typography>
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleCheckOutClick('welcomeBasket')}
              sx={buttonSx}
            >
              <Typography variant="h5">Welcome Basket</Typography>
            </Button>
          </Box>
        </Box>

        {/* Stock Section */}
        <Box data-testid="section-stock">
          <SectionHeader
            icon={<ArrowDownwardIcon />}
            title="Stock"
            subtitle="Add donated or purchased items"
          />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Button variant="outlined" onClick={handleAddOpen} sx={buttonSx}>
              <Typography variant="h5">General Inventory</Typography>
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                /* TODO: Handle Welcome Basket Stock */
              }}
              sx={buttonSx}
            >
              <Typography variant="h5">Welcome Basket</Typography>
            </Button>
          </Box>
        </Box>
      </Box>

      <AddItemModal
        addModal={addModal}
        handleAddClose={handleAddClose}
        fetchData={fetchData}
        originalData={originalData}
        showResults={showResults}
        setShowResults={setShowResults}
      />

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
