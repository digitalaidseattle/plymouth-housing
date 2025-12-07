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
  findTransactionHistory,
  getUsers,
} from '../../components/History/HistoryAPICalls';
import CircularLoader from '../../components/CircularLoader';
import { Building } from '../../types/interfaces';
import { getBuildings } from '../../components/Checkout/CheckoutAPICalls';
import CheckoutHistoryCard from '../../components/History/CheckoutHistoryCard';
import CustomDateDialog from '../../components/History/CustomDateDialog';

type CheckoutTransactionData = {
  building_id: number;
  id: string;
  item_id: number;
  quantity: number;
  resident_name: string;
  timestamp: string;
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
    isCustom?: boolean;
  }>({ startDate: todaysDate, endDate: todaysDate });
  const [dateInput, setDateInput] = useState('today');
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);
  const [historyType, setHistoryType] = useState<'checkout' | 'inventory'>(
    'checkout',
  );
  const formattedDateRange = {
    startDate: dateRange.startDate.toLocaleDateString('en-CA'),
    endDate: dateRange.endDate.toLocaleDateString('en-CA'),
  };

  const dateString = dateRange.startDate.toLocaleString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const dateRangeString =
    dateRange.startDate.toLocaleString('en-us', {
      month: 'short',
      day: 'numeric',
    }) +
    ' - ' +
    dateRange.endDate.toLocaleString('en-us', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  useEffect(() => {
    async function findHistoryForSelectedDate() {
      try {
        setIsLoading(true);
        const response = await findTransactionHistory(
          user,
          formattedDateRange.startDate,
          formattedDateRange.endDate,
          historyType,
        );
        setHistory(response);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    }
    findHistoryForSelectedDate();
    setIsLoading(false);
  }, [dateRange, historyType]);

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
    }
  }

  // restructures database response to organize transacations by User
  const processTransactionsByUser = () => {
    const result = [];
    if (!history) return;
    const uniqueUsers = [...new Set(history.map((t) => t.user_id))];
    if (historyType === 'inventory') {
      uniqueUsers.forEach((userId, userIndex) => {
        result.push({ user_id: userId, transactions: [] });
        history
          .filter((entry) => entry.user_id === userId)
          .forEach((entry) => {
            result[userIndex].transactions.push({
              id: entry.id,
              unit_number: entry.unit_number,
              item_id: entry.item_id,
              item_name: entry.item_name,
              category_name: entry.category_name,
              quantity: entry.quantity,
              timestamp: entry.timestamp,
            });
          });
      });
    } else {
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
                timestamp: entry.timestamp,
              });
            }
          });
      });
    }
    return result;
  };

  const transactionsByUser = processTransactionsByUser();

  return (
    <Stack gap="2rem" sx={{ paddingY: 5 }}>
      <CustomDateDialog
        showDialog={showCustomDateDialog}
        handleShowDialog={() => setShowCustomDateDialog(!showCustomDateDialog)}
        handleSetDateRange={(newStartDate: Date, newEndDate: Date) =>
          setDateRange({
            startDate: newStartDate,
            endDate: newEndDate,
            isCustom: true,
          })
        }
      />
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
          <Button onClick={() => setHistoryType('checkout')}>Check outs</Button>
          <Button onClick={() => setHistoryType('inventory')}>
            Inventory edits
          </Button>
        </Stack>
        <FormControl>
          <InputLabel id="select-date-label">Date</InputLabel>
          <Select
            labelId="select-date-label"
            id="select-date"
            value={dateInput}
            label="Date"
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setShowCustomDateDialog(true);
                setDateInput('custom');
                setHistory(null);
              } else {
                handleDateSelection(e.target.value);
              }
            }}
            sx={{ width: '10rem' }}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="this week">This Week</MenuItem>
            <MenuItem value="custom">
              {dateRange.isCustom ? dateRangeString : 'Custom'}
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" alignItems="center" gap="1.5rem">
        {dateRange.isCustom ? (
          <>
            <Typography variant="h2" textTransform="capitalize">
              {dateRangeString}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h2" textTransform="capitalize">
              {dateInput}
            </Typography>
          </>
        )}
        {dateInput === 'custom' ? (
          <Button onClick={() => setShowCustomDateDialog(true)}>
            Change date range
          </Button>
        ) : (
          <Typography variant="body1">
            {dateInput !== 'this week' ? dateString : dateRangeString}
          </Typography>
        )}
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
                  const dateCreated = new Date(t.timestamp);
                  const seconds =
                    (todaysDate.getTime() - dateCreated.getTime()) / 1000;
                  const minutes = Math.floor(seconds / 60);
                  const hours = Math.floor(minutes / 60);
                  const days = Math.floor(hours / 24);
                  if (historyType === 'checkout') {
                    const quantity = t.items.reduce((acc, item) => {
                      return acc + item.quantity;
                    }, 0);
                    return (
                      <CheckoutHistoryCard transactionId={t.id}>
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
                          <p>
                            Created{' '}
                            {days === 1
                              ? '1 day'
                              : days > 1
                              ? days + ' days'
                              : ''}
                            {days === 0 && hours === 1
                              ? '1 hour'
                              : days === 0 && hours > 1
                              ? hours + ' hours'
                              : ''}
                            {hours < 1 && minutes + ' min'}
                            {' ago'}
                          </p>
                        </div>
                        <Chip
                          color={quantity > 10 ? 'warning' : 'success'}
                          label={`${quantity} / 10`}
                        />
                      </CheckoutHistoryCard>
                    );
                  } else {
                    // historyType === 'inventory'
                    console.log(t);
                    return (
                      <CheckoutHistoryCard transactionId={t.id}>
                        <div>
                          <h3>{t.item_name}</h3>
                          <p>{t.category_name}</p>
                          <p>
                            Created{' '}
                            {days === 1
                              ? '1 day'
                              : days > 1
                              ? days + ' days'
                              : ''}
                            {days === 0 && hours === 1
                              ? '1 hour'
                              : days === 0 && hours > 1
                              ? hours + ' hours'
                              : ''}
                            {hours < 1 && minutes + ' min'}
                            {' ago'}
                          </p>
                        </div>
                        <p>{t.quantity} items</p>
                      </CheckoutHistoryCard>
                    );
                  }
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
