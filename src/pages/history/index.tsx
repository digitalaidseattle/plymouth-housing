import React, { useState, useContext, useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { UserContext } from '../../components/contexts/UserContext';
import { findCheckoutHistory } from '../../components/History/HistoryAPICalls';

const HistoryPage: React.FC = () => {
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState(null);

  const todaysDate = new Date();
  const formattedDate = todaysDate.toLocaleDateString('en-CA');
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  if (isLoading) {
    return <p>Loading ...</p>;
  }

  useEffect(() => {
    async function findTodaysHistory() {
      const response = await findCheckoutHistory(user, formattedDate);
      console.log('the response!', response);
      setHistory(response);
    }
    findTodaysHistory();
  }, []);

  return (
    <Box sx={{ paddingY: 5 }}>
      <Stack direction="row" alignItems="center" gap="1.5rem">
        <Typography variant="h2">Today</Typography>
        <Typography variant="body1">
          {todaysDate.toLocaleString('en-us', dateOptions)}
        </Typography>
      </Stack>
    </Box>
  );
};

export default HistoryPage;
