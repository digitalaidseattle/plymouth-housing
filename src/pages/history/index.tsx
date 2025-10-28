import React, { useState, useContext } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';

const HistoryPage: React.FC = () => {
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <p>Loading ...</p>;
  }

  return (
    <Box sx={{ paddingX: 20, paddingY: 5, height: '75vh' }}>history page</Box>
  );
};

export default HistoryPage;
