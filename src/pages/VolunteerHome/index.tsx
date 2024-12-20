import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import AddItemModal from '../../components/AddItemModal/AddItemModal';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS, HEADERS } from '../../types/constants';
import { CategoryItem, InventoryItem } from '../../types/interfaces.ts';

const VolunteerHome: React.FC = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [addModal, setAddModal] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState<InventoryItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.ITEMS, {
        headers: HEADERS,
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

  const fetchCategories = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.CATEGORY, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setCategories(data.value);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [fetchData, fetchCategories]);

  const handleAddOpen = () => {
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
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} sm={6} md={6}>
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

        <Grid item xs={12} sm={6} md={6}>
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
            fetchData={fetchData}
            categoryData={categories}
            originalData={originalData}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default VolunteerHome;
