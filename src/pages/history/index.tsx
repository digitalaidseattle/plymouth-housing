import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import {
  findCheckoutHistory,
  findInventoryHistory,
  getUsers,
} from '../../components/History/HistoryAPICalls';
import CircularLoader from '../../components/CircularLoader';
import { Building, CategoryProps, User } from '../../types/interfaces';
import { getBuildings } from '../../components/Checkout/CheckoutAPICalls';
import CustomDateDialog from '../../components/History/CustomDateDialog';
import fetchCategorizedItems from '../../components/utils/fetchCategorizedItems';
import GeneralCheckoutCard from '../../components/History/GeneralCheckoutCard';
import WelcomeBasketCard from '../../components/History/WelcomeBasketCard';
import InventoryCard from '../../components/History/InventoryCard';
import {
  createHowLongAgoString,
  calculateTimeDifference,
  formatDateRange,
  formatFullDate,
} from '../../components/History/historyUtils';
import { processTransactionsByUser } from '../../components/History/transactionProcessors';
import { CheckoutTransaction, InventoryTransaction } from '../../types/history';
import SnackbarAlert from '../../components/SnackbarAlert';

const HistoryPage: React.FC = () => {
  const todaysDate = new Date();
  const { user, loggedInUserId } = useContext(UserContext);
  const [userList, setUserList] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userHistory, setUserHistory] = useState<
    CheckoutTransaction[] | InventoryTransaction[] | null
  >(null);
  const [buildings, setBuildings] = useState<Building[] | null>(null);
  const [categorizedItems, setCategorizedItems] = useState<CategoryProps[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
    isCustom?: boolean;
  }>({ startDate: todaysDate, endDate: todaysDate });
  const [dateInput, setDateInput] = useState('today');
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'warning' });

  const [historyType, setHistoryType] = useState<'checkout' | 'inventory'>(
    'checkout',
  );
  // en-CA locale produces YYYY-MM-DD format (ISO 8601) required by SQL Server DATE columns
  const formattedDateRange = useMemo(
    () => ({
      startDate: dateRange.startDate.toLocaleDateString('en-CA'),
      endDate: dateRange.endDate.toLocaleDateString('en-CA'),
    }),
    [dateRange],
  );

  const dateString = formatFullDate(dateRange.startDate);
  const dateRangeString = formatDateRange(
    dateRange.startDate,
    dateRange.endDate,
  );

  useEffect(() => {
    async function findUserHistoryForSelectedDate() {
      try {
        setIsLoading(true);
        const response =
          historyType === 'checkout'
            ? await findCheckoutHistory(
                user,
                formattedDateRange.startDate,
                formattedDateRange.endDate,
                categorizedItems,
              )
            : await findInventoryHistory(
                user,
                formattedDateRange.startDate,
                formattedDateRange.endDate,
                categorizedItems,
              );
        setUserHistory(response);
      } catch (error) {
        setError('Error fetching history: ' + error);
      } finally {
        setIsLoading(false);
      }
    }
    findUserHistoryForSelectedDate();
  }, [formattedDateRange, historyType, user, categorizedItems]);

  useEffect(() => {
    async function getUserList() {
      try {
        const response = await getUsers(user);
        setUserList(response);
      } catch (error) {
        setError('Error fetching users: ' + error);
      }
    }
    async function fetchBuildings() {
      try {
        const response = await getBuildings(user);
        setBuildings(response);
      } catch (error) {
        setError('Error fetching buildings: ' + error);
      }
    }
    async function getCategorizedItems() {
      try {
        const userRole = getRole(user);
        const response = await fetchCategorizedItems(userRole);
        setCategorizedItems(response);
      } catch (error) {
        setError('Error fetching item and category data: ' + error);
      }
    }
    async function loadInitialData() {
      try {
        setIsLoading(true);
        await Promise.all([
          getUserList(),
          fetchBuildings(),
          getCategorizedItems(),
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (error) {
      setSnackbarState({ open: true, message: error, severity: 'error' });
    }
  }, [error]);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarState({ ...snackbarState, open: false });
  };

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
  const transactionsByUser = useMemo(
    () => processTransactionsByUser(userHistory, loggedInUserId),
    [userHistory, loggedInUserId],
  );

  return (
    <Stack gap="2rem" sx={{ paddingY: 5 }}>
      <SnackbarAlert
        open={snackbarState.open}
        onClose={handleSnackbarClose}
        severity={snackbarState.severity}
      >
        {snackbarState.message}
      </SnackbarAlert>
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
        handleSetDateInput={() => setDateInput('custom')}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap="1rem">
          <Button
            variant={
              historyType === 'checkout' ? 'active-primary' : 'inactive-primary'
            }
            onClick={() => setHistoryType('checkout')}
          >
            Check out
          </Button>
          <Button
            variant={
              historyType === 'inventory'
                ? 'active-primary'
                : 'inactive-primary'
            }
            onClick={() => setHistoryType('inventory')}
          >
            Inventory
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
        <Typography variant="h2" textTransform="capitalize">
          {dateRange.isCustom ? dateRangeString : dateInput}
        </Typography>
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
          {userHistory && userHistory.length === 0 && (
            <p>
              No transactions found for this date. Try selecting a different
              date range.
            </p>
          )}
          {transactionsByUser?.map((user) => (
            <Box key={user.user_id}>
              <Stack direction="row" alignItems="center" gap="1rem">
                <h2>
                  {loggedInUserId === user.user_id
                    ? 'You'
                    : (userList?.find((v) => v.id === user.user_id)?.name ??
                      '')}
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
                {user.transactions.map(
                  (t: CheckoutTransaction | InventoryTransaction) => {
                    const { minutes, hours, days } = calculateTimeDifference(
                      t.transaction_date,
                    );
                    const howLongAgoString = createHowLongAgoString(
                      minutes,
                      hours,
                      days,
                    );
                    const checkoutTransaction = t as CheckoutTransaction;
                    if (
                      historyType === 'checkout' &&
                      checkoutTransaction.item_type === 'general'
                    ) {
                      const quantity = checkoutTransaction.items.reduce(
                        (acc, item) => {
                          return acc + item.quantity;
                        },
                        0,
                      );
                      return (
                        <GeneralCheckoutCard
                          key={t.transaction_id}
                          checkoutTransaction={checkoutTransaction}
                          buildings={buildings}
                          quantity={quantity}
                          howLongAgoString={howLongAgoString}
                        />
                      );
                    } else if (
                      historyType === 'checkout' &&
                      checkoutTransaction.item_type === 'welcome'
                    ) {
                      return (
                        <WelcomeBasketCard
                          key={t.transaction_id}
                          checkoutTransaction={checkoutTransaction}
                          buildings={buildings}
                          howLongAgoString={howLongAgoString}
                        />
                      );
                    } else if (historyType === 'inventory') {
                      const inventoryTransaction = t as InventoryTransaction;
                      return (
                        <InventoryCard
                          key={inventoryTransaction.transaction_id}
                          inventoryTransaction={inventoryTransaction}
                          howLongAgoString={howLongAgoString}
                        />
                      );
                    }
                  },
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default HistoryPage;
