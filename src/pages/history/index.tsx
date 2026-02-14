import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { UserContext } from '../../components/contexts/UserContext';
import {
  getCheckoutHistory,
  getInventoryHistory,
} from '../../components/History/HistoryAPICalls';
import CircularLoader from '../../components/CircularLoader';
import CustomDateDialog from '../../components/History/CustomDateDialog';
import GeneralCheckoutCard from '../../components/History/GeneralCheckoutCard';
import WelcomeBasketCard from '../../components/History/WelcomeBasketCard';
import InventoryCard from '../../components/History/InventoryCard';
import {
  createHowLongAgoString,
  calculateTimeDifference,
} from '../../components/History/historyUtils';
import { processTransactionsByUser } from '../../components/History/transactionProcessors';
import { CheckoutTransaction, InventoryTransaction } from '../../types/history';
import SnackbarAlert from '../../components/SnackbarAlert';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useDateRangeFilter, DatePreset } from '../../hooks/useDateRangeFilter';
import { useReferenceData } from '../../hooks/useReferenceData';

const HistoryPage: React.FC = () => {
  const { user, loggedInUserId } = useContext(UserContext);
  const { snackbarState, showSnackbar, handleClose } = useSnackbar();
  const {
    dateRange,
    dateInput,
    showCustomDateDialog,
    formattedDateRange,
    dateString,
    dateRangeString,
    handleDateSelection,
    handleSetCustomDateRange,
    toggleCustomDateDialog,
  } = useDateRangeFilter();
  const {
    userList,
    buildings,
    categorizedItems,
    isLoading: isLoadingReferenceData,
  } = useReferenceData({ user, onError: showSnackbar });

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [userHistory, setUserHistory] = useState<
    CheckoutTransaction[] | InventoryTransaction[] | null
  >(null);

  const [historyType, setHistoryType] = useState<'checkout' | 'inventory'>(
    'checkout',
  );

  const isLoading = isLoadingReferenceData || isLoadingHistory;

  useEffect(() => {
    async function findUserHistoryForSelectedDate() {
      try {
        setIsLoadingHistory(true);
        const response =
          historyType === 'checkout'
            ? await getCheckoutHistory(
                user,
                formattedDateRange.startDate,
                formattedDateRange.endDate,
                categorizedItems,
              )
            : await getInventoryHistory(
                user,
                formattedDateRange.startDate,
                formattedDateRange.endDate,
                categorizedItems,
              );
        setUserHistory(response);
      } catch (error) {
        showSnackbar('Error fetching history: ' + error);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    findUserHistoryForSelectedDate();
  }, [formattedDateRange, historyType, user, categorizedItems, showSnackbar]);

  const transactionsByUser = useMemo(
    () => processTransactionsByUser(userHistory ?? [], loggedInUserId ?? 0),
    [userHistory, loggedInUserId],
  );

  return (
    <Stack gap="2rem" sx={{ paddingY: 5 }}>
      <SnackbarAlert
        open={snackbarState.open}
        onClose={handleClose}
        severity={snackbarState.severity}
      >
        {snackbarState.message}
      </SnackbarAlert>
      <CustomDateDialog
        showDialog={showCustomDateDialog}
        handleShowDialog={toggleCustomDateDialog}
        handleSetDateRange={handleSetCustomDateRange}
        handleSetDateInput={() => {}}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <ToggleButtonGroup
          value={historyType}
          exclusive
          onChange={(_, newType) => newType && setHistoryType(newType)}
          sx={{
            gap: '1rem',
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '18px !important', // Override grouped styles
              marginLeft: '0 !important',
            },
          }}
        >
          <ToggleButton
            value="checkout"
            sx={{
              padding: '1rem 2rem',
              borderRadius: '18px',
              fontSize: '1.25rem',
              border: 'none',
              textTransform: 'none',
              backgroundColor: 'grey.100',
              color: 'text.primary',
              '&.Mui-selected': {
                backgroundColor: 'primary.dark',
                color: 'common.white',
                border: 'none',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
              '&:hover': {
                backgroundColor: 'grey.200',
              },
            }}
          >
            Check out
          </ToggleButton>
          <ToggleButton
            value="inventory"
            sx={{
              padding: '1rem 2rem',
              borderRadius: '18px',
              fontSize: '1.25rem',
              border: 'none',
              textTransform: 'none',
              backgroundColor: 'grey.100',
              color: 'text.primary',
              '&.Mui-selected': {
                backgroundColor: 'primary.dark',
                color: 'common.white',
                border: 'none',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
              '&:hover': {
                backgroundColor: 'grey.200',
              },
            }}
          >
            Inventory
          </ToggleButton>
        </ToggleButtonGroup>
        <FormControl>
          <InputLabel id="select-date-label">Date</InputLabel>
          <Select
            labelId="select-date-label"
            id="select-date"
            value={dateInput}
            label="Date"
            onChange={(e) => {
              const value = e.target.value as DatePreset;
              if (value === 'custom') {
                toggleCustomDateDialog();
              } else {
                handleDateSelection(value);
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
          <Button onClick={toggleCustomDateDialog}>Change date range</Button>
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
