import React, { useState, useContext, useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { UserContext } from '../../components/contexts/UserContext';
import { findCheckoutHistory } from '../../components/History/HistoryAPICalls';
import CheckoutHistoryCard from '../../components/History/CheckoutHistoryCard';
import { pink } from '@mui/material/colors';

const HistoryPage: React.FC = () => {
  const { user, activeVolunteers } = useContext(UserContext);
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

  const getTransactionsByUser = () => {
    const result = [];
    if (!history) return;
    const uniqueUsers = [...new Set(history.map((t) => t.user_id))];
    uniqueUsers.forEach((userId, userIndex) => {
      result.push({ user_id: userId, transactions: [] });
      history
        .filter((entry) => entry.user_id === userId)
        .forEach((entry) => {
          const transactionIndex = result[userIndex].transactions.findIndex(
            (r) => r.id === entry.id,
          );
          if (transactionIndex !== -1) {
            result[userIndex].transactions[transactionIndex].items.push({
              item_id: entry.item_id,
              quantity: entry.quantity,
            });
          } else {
            result[userIndex].transactions.push({
              id: entry.id,
              resident_name: entry.resident_name,
              items: [{ item_id: entry.item_id, quantity: entry.quantity }],
            });
          }
        });
    });
    return result;
  };

  const transactionsByUser = getTransactionsByUser();
  console.log(transactionsByUser);

  return (
    <Box sx={{ paddingY: 5 }}>
      <Stack direction="row" alignItems="center" gap="1.5rem">
        <Typography variant="h2">Today</Typography>
        <Typography variant="body1">
          {todaysDate.toLocaleString('en-us', dateOptions)}
        </Typography>
      </Stack>
      <Stack>
        {transactionsByUser?.map((user) => (
          <Box>
            <h2>
              {activeVolunteers &&
                activeVolunteers.find((v) => v.id === user.user_id).name}
            </h2>
            <Stack gap="1rem">
              {user.transactions.map((t) => (
                <Box
                  sx={{
                    border: '1px lightgray solid',
                    borderRadius: '10px',
                    paddingX: '1rem',
                  }}
                >
                  <h3>{t.resident_name}</h3>
                  <p>{t.items.length} / 10</p>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default HistoryPage;
