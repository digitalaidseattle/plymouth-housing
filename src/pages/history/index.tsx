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
  useTheme,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import {
  findTransactionHistory,
  getUsers,
} from '../../components/History/HistoryAPICalls';
import CircularLoader from '../../components/CircularLoader';
import { Building, CategoryProps, User } from '../../types/interfaces';
import { getBuildings } from '../../components/Checkout/CheckoutAPICalls';
import CheckoutHistoryCard from '../../components/History/CheckoutHistoryCard';
import CustomDateDialog from '../../components/History/CustomDateDialog';
import {
  TransactionType,
  CheckoutItemResponse,
  InventoryItemResponse,
  HistoryResponse,
  CheckoutTransaction,
  InventoryTransaction,
  TransactionsByUser,
} from '../../types/history';
import fetchCategorizedItems from '../../components/helpers/fetchCategorizedItems';

const HistoryPage: React.FC = () => {
  const theme = useTheme();
  const todaysDate = new Date();
  const { user, loggedInUserId } = useContext(UserContext);
  const [userList, setUserList] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryResponse[] | null>(null);
  const [buildings, setBuildings] = useState<Building[] | null>(null);
  const [categorizedItems, setCategorizedItems] = useState<CategoryProps[]>([]);
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
    async function getCategorizedItems() {
      try {
        const userRole = getRole(user);
        const response = await fetchCategorizedItems(userRole);
        setCategorizedItems(response);
      } catch (error) {
        console.error('Error fetching item and category data:', error);
      }
    }
    getUserList();
    fetchBuildings();
    getCategorizedItems();
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

  const createInventoryTransaction = (
    entry: HistoryResponse,
  ): InventoryTransaction => {
    const inventoryEntry = entry as InventoryItemResponse;
    return {
      id: inventoryEntry.id,
      transaction_type: inventoryEntry.transaction_type,
      item_id: inventoryEntry.item_id,
      item_name: inventoryEntry.item_name,
      category_name: inventoryEntry.category_name,
      quantity: inventoryEntry.quantity,
      timestamp: inventoryEntry.timestamp,
      item_type: checkIfWelcomeBasket(inventoryEntry.item_id)
        ? 'welcome-basket'
        : 'general',
    };
  };

  const mergeCheckoutTransaction = (
    transactions: (CheckoutTransaction | InventoryTransaction)[],
    entry: HistoryResponse,
  ): (CheckoutTransaction | InventoryTransaction)[] => {
    const checkoutEntry = entry as CheckoutItemResponse;
    const existingIndex = transactions.findIndex(
      (t) => t.id === checkoutEntry.id,
    );

    if (existingIndex !== -1) {
      const existing = transactions[existingIndex] as CheckoutTransaction;
      existing.items.push({
        item_id: checkoutEntry.item_id,
        quantity: checkoutEntry.quantity,
      });
      return transactions;
    }

    return [
      ...transactions,
      {
        id: checkoutEntry.id,
        resident_name: checkoutEntry.resident_name,
        building_id: checkoutEntry.building_id,
        unit_number: checkoutEntry.unit_number,
        items: [
          {
            item_id: checkoutEntry.item_id,
            quantity: checkoutEntry.quantity,
          },
        ],
        timestamp: checkoutEntry.timestamp,
        item_type: checkIfWelcomeBasket(checkoutEntry.item_id)
          ? 'welcome-basket'
          : 'general',
      },
    ];
  };

  // restructures database response to organize transactions by User
  const processTransactionsByUser = () => {
    if (!history) return [];
    let uniqueUsers = [...new Set(history.map((t) => t.user_id))];
    // check if logged in user is in the array; if so, put this user at the front of the list
    if (
      loggedInUserId &&
      uniqueUsers.find((userId) => userId === loggedInUserId)
    ) {
      const filteredUsers = uniqueUsers.filter(
        (userId) => userId !== loggedInUserId,
      );
      uniqueUsers = [loggedInUserId, ...filteredUsers];
    }

    const sortedTransactionsByUser = uniqueUsers.map((userId) => ({
      user_id: userId,
      transactions: history
        .filter((entry) => entry.user_id === userId)
        .reduce(
          (transactions, entry) => {
            if (historyType === 'inventory') {
              return [...transactions, createInventoryTransaction(entry)];
            }
            return mergeCheckoutTransaction(transactions, entry);
          },
          [] as (CheckoutTransaction | InventoryTransaction)[],
        ),
    }));
    return sortedTransactionsByUser;
  };

  const transactionsByUser = processTransactionsByUser();

  function checkIfWelcomeBasket(itemId: number) {
    if (categorizedItems) {
      const welcomeBasket = categorizedItems.find(
        (c) => c.category === 'Welcome Basket',
      );
      const welcomeBasketIds = welcomeBasket?.items.map((i) => i.id);
      return welcomeBasketIds?.includes(itemId);
    }
  }

  function createHowLongAgoString(
    minutes: number,
    hours: number,
    days: number,
  ): string {
    const getTimeUnit = (): string => {
      if (days > 0) {
        return days === 1 ? '1 day' : `${days} days`;
      }
      if (hours > 0) {
        return hours === 1 ? '1 hour' : `${hours} hours`;
      }
      return `${minutes} min`;
    };
    return `Created ${getTimeUnit()} ago`;
  }

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
        handleSetDateInput={() => setDateInput('custom')}
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
          <Button
            variant={
              historyType === 'checkout' ? 'active-toggle' : 'inactive-toggle'
            }
            onClick={() => setHistoryType('checkout')}
          >
            Check out
          </Button>
          <Button
            variant={
              historyType === 'inventory' ? 'active-toggle' : 'inactive-toggle'
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
          {history && history.length === 0 && (
            <p>There are no transactions for this date.</p>
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
                {user.transactions.map((t) => {
                  const dateCreated = new Date(t.timestamp);
                  const seconds =
                    (todaysDate.getTime() - dateCreated.getTime()) / 1000;
                  const minutes = Math.floor(seconds / 60);
                  const hours = Math.floor(minutes / 60);
                  const days = Math.floor(hours / 24);
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
                      <CheckoutHistoryCard
                        key={checkoutTransaction.id}
                        transactionId={checkoutTransaction.id}
                      >
                        <div>
                          <h3>{checkoutTransaction.resident_name}</h3>
                          <p>
                            {buildings?.find(
                              (b) => b.id === checkoutTransaction.building_id,
                            )?.code ?? ''}
                            {' - '}
                            {buildings?.find(
                              (b) => b.id === checkoutTransaction.building_id,
                            )?.name ?? ''}
                            {' - '}
                            {checkoutTransaction.unit_number}
                          </p>
                          <p>{howLongAgoString}</p>
                        </div>
                        <Chip
                          sx={{
                            color:
                              quantity > 10
                                ? theme.palette.warning.dark
                                : theme.palette.success.dark,
                            backgroundColor:
                              quantity > 10
                                ? theme.palette.warning.lighter
                                : theme.palette.success.lighter,
                          }}
                          label={`${quantity} / 10`}
                        />
                      </CheckoutHistoryCard>
                    );
                  } else if (
                    historyType === 'checkout' &&
                    checkoutTransaction.item_type === 'welcome-basket'
                  ) {
                    const itemIds = checkoutTransaction.items.map(
                      (i) => i.item_id,
                    );
                    let welcomeBasketType;
                    // TODO: is there a way to identify the welcome-basket-type w/o hardcoded values?
                    if (itemIds.includes(175)) {
                      welcomeBasketType = 'Twin-size Sheet Set';
                    } else if (itemIds.includes(176)) {
                      welcomeBasketType = 'Full-size Sheet Set';
                    } else {
                      welcomeBasketType = 'Other';
                    }
                    return (
                      <CheckoutHistoryCard
                        transactionId={checkoutTransaction.id}
                      >
                        <div>
                          <h3>Welcome Basket: {welcomeBasketType}</h3>
                          <p>
                            {buildings?.find(
                              (b) => b.id === checkoutTransaction.building_id,
                            )?.code ?? ''}
                            {' - '}
                            {buildings?.find(
                              (b) => b.id === checkoutTransaction.building_id,
                            )?.name ?? ''}
                          </p>
                          <p>{howLongAgoString}</p>
                        </div>
                      </CheckoutHistoryCard>
                    );
                  } else if (historyType === 'inventory') {
                    const inventoryTransaction = t as InventoryTransaction;
                    return (
                      <CheckoutHistoryCard transactionId={t.id}>
                        <div>
                          <h3>{inventoryTransaction.item_name}</h3>
                          <p>{inventoryTransaction.category_name}</p>
                          <p>{howLongAgoString}</p>
                        </div>
                        {inventoryTransaction.transaction_type ===
                        TransactionType.InventoryAdd ? (
                          <p>
                            {inventoryTransaction.quantity > 0
                              ? 'Added'
                              : 'Removed'}{' '}
                            {Math.abs(inventoryTransaction.quantity)} items
                          </p>
                        ) : (
                          <p>
                            {'Replaced quantity:' +
                              inventoryTransaction.quantity}
                          </p>
                        )}
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
