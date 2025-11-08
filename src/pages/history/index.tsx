import React, { useState, useContext, useEffect } from 'react';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { UserContext } from '../../components/contexts/UserContext';
import { findCheckoutHistory } from '../../components/History/HistoryAPICalls';
import CheckoutHistoryCard from '../../components/History/CheckoutHistoryCard';

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
  const buildings = JSON.parse(sessionStorage.getItem('buildings'));

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
              building_id: entry.building_id,
              unit_number: entry.unit_number,
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
      <Stack
        direction="row"
        alignItems="center"
        gap="1.5rem"
        marginBottom="1rem"
      >
        <Typography variant="h2">Today</Typography>
        <Typography variant="body1">
          {todaysDate.toLocaleString('en-us', dateOptions)}
        </Typography>
      </Stack>
      <Stack gap="2rem">
        {transactionsByUser?.map((user) => (
          <Box key={user.user_id}>
            <Stack direction="row" alignItems="center" gap="1rem">
              <h2>
                {activeVolunteers &&
                  activeVolunteers.find((v) => v.id === user.user_id).name}
              </h2>
              <span>
                {user.transactions.length}{' '}
                {user.transactions.length > 1 ? 'records' : 'record'}
              </span>
            </Stack>
            <Stack gap="1rem">
              {user.transactions.map((t) => {
                const quantity = t.items.reduce((acc, item) => {
                  return acc + item.quantity;
                }, 0);

                return (
                  <Box
                    key={t.id}
                    sx={{
                      border: '1px lightgray solid',
                      borderRadius: '10px',
                      paddingX: '1rem',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <div>
                        <h3>{t.resident_name}</h3>
                        <p>
                          {buildings.find((b) => b.id === t.building_id).code}
                          {' - '}
                          {buildings.find((b) => b.id === t.building_id).name}
                          {' - '}
                          {t.unit_number}
                        </p>
                      </div>
                      <Chip
                        color={quantity > 10 ? 'warning' : 'success'}
                        label={`${quantity}
                      / 10`}
                      ></Chip>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default HistoryPage;
