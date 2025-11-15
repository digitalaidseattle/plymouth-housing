import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  TextField,
} from '@mui/material';
import { Search } from '@mui/icons-material';
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
  const todaysDate = new Date();
  const { user, loggedInUserId } = useContext(UserContext);
  const [userList, setUserList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<CheckoutTransactionData[] | null>(
    null,
  );
  const [buildings, setBuildings] = useState<Building[] | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({ startDate: todaysDate, endDate: todaysDate });
  const [dateInput, setDateInput] = useState('today');
  const formattedDateRange = {
    startDate: dateRange.startDate.toLocaleDateString('en-CA'),
    endDate: dateRange.endDate.toLocaleDateString('en-CA'),
  };

  const dateOptionsLong = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  useEffect(() => {
    async function findHistoryForSelectedDate() {
      try {
        setIsLoading(true);
        const response = await findCheckoutHistory(
          user,
          formattedDateRange.startDate,
          formattedDateRange.endDate,
        );
        setHistory(response);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    }
    findHistoryForSelectedDate();
    setIsLoading(false);
  }, [dateRange]);

  useEffect(() => {
    async function getUserList() {
      try {
        const response = await getUsers(user);
        setUserList(response);
      } catch (error) {
        console.error('Error fetching users:', error);
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
    fetchBuildings();
    setIsLoading(false);
  }, []);

  function handleDateSelection(dateInput: string) {
    setDateInput(dateInput);
    if (dateInput === 'today') {
      setDateRange({
        startDate: todaysDate,
        endDate: todaysDate,
      });
    } else if (dateInput === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(todaysDate.getDate() - 1);
      setDateRange({
        startDate: yesterday,
        endDate: yesterday,
      });
    } else if (dateInput === 'this week') {
      const lastWeekDate = new Date();
      lastWeekDate.setDate(todaysDate.getDate() - 7);
      setDateRange({
        startDate: lastWeekDate,
        endDate: todaysDate,
      });
    } else {
      // 'custom' was selected
      setHistory(null);
    }
  }

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

  const CustomDateInputs = () => {
    return (
      <Stack direction="row" gap="2rem">
        <Box>
          <label htmlFor="start">Start date:</label>
          <input
            type="date"
            id="start"
            name="start-date"
            value="2018-07-22"
            min="2018-01-01"
            max="2018-12-31"
          />
        </Box>
        <Box>
          <label htmlFor="end">End date:</label>
          <input
            type="date"
            id="end"
            name="end-date"
            value="2018-07-22"
            min="2018-01-01"
            max="2018-12-31"
          />
        </Box>
      </Stack>
    );
  };

  const transactionsByUser = processTransactionsByUser();

  console.log(dateRange);

  return (
    <Stack gap="2rem" sx={{ paddingY: 5 }}>
      <FormControl>
        <TextField
          id="search-input"
          placeholder="Search name, building code..."
          variant="standard"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />
      </FormControl>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap="1rem">
          <Button>Check outs</Button>
          <Button>Inventory edits</Button>
        </Stack>
        <FormControl>
          <InputLabel id="select-date-label">Date</InputLabel>
          <Select
            labelId="select-date-label"
            id="select-date"
            value={dateInput}
            label="Date"
            onChange={(e) => handleDateSelection(e.target.value)}
            sx={{ width: '10rem' }}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="this week">This Week</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" alignItems="center" gap="1.5rem">
        <Typography variant="h2" textTransform="capitalize">
          {dateInput}
        </Typography>
        <Typography variant="body1">
          {dateInput !== 'this week'
            ? dateRange.startDate.toLocaleString('en-us', dateOptionsLong)
            : dateRange.startDate.toLocaleString('en-us', {
                month: 'short',
                day: 'numeric',
              }) +
              ' - ' +
              dateRange.endDate.toLocaleString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
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
                    : userList?.find((v) => v.id === user.user_id)?.name ?? ''}
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
                            {buildings?.find((b) => b.id === t.building_id)
                              ?.code ?? ''}
                            {' - '}
                            {buildings?.find((b) => b.id === t.building_id)
                              ?.name ?? ''}
                            {' - '}
                            {t.unit_number}
                          </p>
                        </div>
                        <Chip
                          color={quantity > 10 ? 'warning' : 'success'}
                          label={`${quantity} / 10`}
                        />
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default HistoryPage;
