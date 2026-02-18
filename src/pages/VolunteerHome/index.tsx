import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Button, Grid } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AddItemModal from '../../components/inventory/AddItemModal.tsx';
import { UserContext } from '../../components/contexts/UserContext';
import { getRole } from '../../utils/userUtils';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { InventoryItem } from '../../types/interfaces.ts';
import SnackbarAlert from '../../components/SnackbarAlert.tsx';

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
    severity: 'success' });

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarState({...snackbarState, open: false });
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

  const handleCheckOutClick = (checkoutType: 'general' | 'welcomeBasket' = 'general') => {
    navigate('/checkout', { state: { checkoutType } });
  };

  if (isLoading) {
    return <p>Loading ...</p>;
  }

  return (
    <Box sx={{ paddingX: 20, paddingY: 5, height: '75vh' }}>
      {/* Header */}
      <Grid
        container
        spacing={4}
        justifyContent="flex-start"
        sx={{ paddingBottom: 10 }}
      >
        <Grid size ={{xs:12, md:6}}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Thanks for being here! <br />
            Let's make a difference.
          </Typography>
        </Grid>
      </Grid>

      {/* Action Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* General Section */}
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            General
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Button
              variant="outlined"
              onClick={() => handleCheckOutClick('general')}
              sx={{
                flex: 1,
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
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
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 50, mb: 1, color: 'black' }} />
              <Typography variant="h6">Check out</Typography>
            </Button>
            <Button
              variant="outlined"
              onClick={handleAddOpen}
              sx={{
                flex: 1,
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
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
              }}
            >
              <AddIcon sx={{ fontSize: 50, mb: 1, color: 'black' }} />
              <Typography variant="h6">Add item</Typography>
            </Button>
          </Box>
        </Box>

        {/* Welcome Basket Section */}
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Welcome basket
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Button
              variant="outlined"
              onClick={() => handleCheckOutClick('welcomeBasket')}
              sx={{
                flex: 1,
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
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
              }}
            >
              <CardGiftcardIcon sx={{ fontSize: 50, mb: 1, color: 'black' }} />
              <Typography variant="h6">Check out</Typography>
            </Button>
            <Button
              variant="outlined"
              onClick={() => {/* TODO: Handle Welcome Basket Add Item */}}
              sx={{
                flex: 1,
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
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
              }}
            >
              <AddIcon sx={{ fontSize: 50, mb: 1, color: 'black' }} />
              <Typography variant="h6">Add item</Typography>
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
