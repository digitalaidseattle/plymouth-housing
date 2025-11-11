import React, { useState, useContext, useEffect } from 'react';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { UserContext } from '../../components/contexts/UserContext';
import {
  findCheckoutHistory,
  getUsers,
} from '../../components/History/HistoryAPICalls';
import CircularLoader from '../../components/CircularLoader';
import { Building } from '../../types/interfaces';
import { getBuildings } from '../../components/Checkout/CheckoutAPICalls';

type CheckoutTransactionData = {
  building_id: number;
  id: string;
  item_id: number;
  quantity: number;
  resident_name: string;
  unit_number: string;
  user_id: number;
  user_name: string;
};

const HistoryPage: React.FC = () => {
  const { user, loggedInUserId } = useContext(UserContext);
  const [userList, setUserList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<CheckoutTransactionData[] | null>(
    null,
  );
  const [buildings, setBuildings] = useState<Building[] | null>(null);

  const todaysDate = new Date();
  const formattedDate = todaysDate.toLocaleDateString('en-CA');
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  useEffect(() => {
    async function getUserList() {
      try {
        const response = await getUsers(user);
        setUserList(response);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    async function findTodaysHistory() {
      try {
        const response = await findCheckoutHistory(user, formattedDate);
        setHistory(response);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    }
    async function fetchBuildings() {
      try {
        const response = await getBuildings(user);
        setBuildings(response);
      } catch (error) {
        console.error('Error fetching buildings:', error);
      }
    }
    getUserList();
    findTodaysHistory();
    fetchBuildings();
    setIsLoading(false);
  }, []);

  // restructures database response to organize transacations by User
  const processTransactionsByUser = () => {
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

  const transactionsByUser = processTransactionsByUser();

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
      {isLoading ? (
        <CircularLoader />
      ) : (
        <Stack gap="2rem">
          {history && history.length === 0 && (
            <p>There are no transactions for this date.</p>
          )}
          {transactionsByUser?.map((user) => (
            <Box key={user.user_id}>
              <Stack direction="row" alignItems="center" gap="1rem">
                <h2>
                  {loggedInUserId === user.user_id
                    ? 'You'
                    : userList &&
                      userList.find((v) => v.id === user.user_id).name}
                </h2>
                <span>
                  {user.transactions.length}{' '}
                  {user.transactions.length > 1 ? 'records' : 'record'}
                </span>
              </Stack>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    lg: 'repeat(2, 1fr)',
                    xl: 'repeat(3, 1fr)',
                  },
                  gap: '1rem',
                }}
              >
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
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default HistoryPage;
