import React, { useState, useContext, useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { UserContext } from '../../components/contexts/UserContext';
import { findCheckoutHistory } from '../../components/History/HistoryAPICalls';
import CheckoutHistoryCard from '../../components/History/CheckoutHistoryCard';
import { pink } from '@mui/material/colors';

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

  const processHistoryData = () => {
    const result = [];
    history.forEach((entry) => {
      const index = result.findIndex((r) => r.id === entry.id);
      if (index !== -1) {
        result[index].items.push({
          item_id: entry.item_id,
          quantity: entry.quantity,
        });
      } else {
        result.push({
          id: entry.id,
          user_name: entry.user_name,
          resident_name: entry.resident_name,
          items: [{ item_id: entry.item_id, quantity: entry.quantity }],
        });
      }
    });
    return result;
  };

  const transactionData = processHistoryData();
  console.log(transactionData);

  return (
    <Box sx={{ paddingY: 5 }}>
      <Stack direction="row" alignItems="center" gap="1.5rem">
        <Typography variant="h2">Today</Typography>
        <Typography variant="body1">
          {todaysDate.toLocaleString('en-us', dateOptions)}
        </Typography>
      </Stack>
      <Stack>
        {transactionData.map((trans) => (
          <Box key={trans.id}>
            <h2>{trans.resident_name}</h2>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default HistoryPage;
