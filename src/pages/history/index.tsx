import React, { useState, useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import { UserContext } from '../../components/contexts/UserContext';
import { findCheckoutHistory } from './HistoryAPICalls';

const HistoryPage: React.FC = () => {
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState(null);
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-CA');

  if (isLoading) {
    return <p>Loading ...</p>;
  }

  useEffect(() => {
    async function findTodaysHistory() {
      const response = await findCheckoutHistory(user, formattedDate);
      console.log('the response!', response);
    }
    findTodaysHistory();
  }, []);

  return (
    <Box sx={{ paddingX: 20, paddingY: 5, height: '75vh' }}>history page</Box>
  );
};

export default HistoryPage;
