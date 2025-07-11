import React, { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Button, Grid } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import AddItemModal from '../../components/inventory/AddItemModal.tsx';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { InventoryItem } from '../../types/interfaces.ts';
import SnackbarAlert from '../../components/SnackbarAlert.tsx';

const VolunteerHome: React.FC = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [addModal, setAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState<InventoryItem[]>([]);
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
      API_HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.EXPANDED_ITEMS + '?$first=10000', {
        headers: API_HEADERS,
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
  };

  const handleAddClose = () => {
    setAddModal(false);
  };

  const handleCheckOutClick = () => {
    navigate('/checkout');
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

      {/* Button Grid */}
      <Grid
        container
        spacing={10}
        justifyContent="space-between"
        sx={{ height: '60%' }}
      >
        <Grid size ={{xs:12, md:6}}>
          <Button
            variant="outlined"
            onClick={handleCheckOutClick}
            sx={{
              height: '100%',
              width: '100%',
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
            <Typography variant="h6">Check Out</Typography>
          </Button>
        </Grid>

        <Grid size ={{xs:12, md:6}}>
          <Button
            variant="outlined"
            onClick={handleAddOpen}
            sx={{
              height: '100%',
              width: '100%',
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
            <Typography variant="h6">Add Item</Typography>
          </Button>

          <AddItemModal
            addModal={addModal}
            handleAddClose={handleAddClose}
            handleSnackbar={(message: string) => {     
              setSnackbarState({ open: true, message: message, severity: 'success' });
            }}
            fetchData={fetchData}
            originalData={originalData}
          />
        </Grid>
      </Grid>
    
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
