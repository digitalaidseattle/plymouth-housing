import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const VolunteerHome: React.FC = () => {
  const navigate = useNavigate();
  
  const handleAddItemClick = () => {
    navigate('/inventory');
  };

  const handleCheckOutClick = () => {
    navigate('/checkout');
  };

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
            onClick={handleAddItemClick}
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default VolunteerHome;