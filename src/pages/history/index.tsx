import React, { useState, useContext } from 'react';
import {
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
import CircularLoader from '../../components/CircularLoader';
import CustomDateDialog from '../../components/History/CustomDateDialog';
import TransactionsList from '../../components/History/TransactionsList';
import SnackbarAlert from '../../components/SnackbarAlert';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useDateRangeFilter, DatePreset } from '../../hooks/useDateRangeFilter';
import { useReferenceData } from '../../hooks/useReferenceData';
import { useHistoryData } from '../../hooks/useHistoryData';

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
    singleWelcomeBasketQuantity,
  } = useReferenceData({ user, onError: showSnackbar });

  const [historyType, setHistoryType] = useState<'checkout' | 'inventory'>(
    'checkout',
  );

  const {
    userHistory,
    transactionsByUser,
    isLoading: isLoadingHistory,
  } = useHistoryData({
    user,
    formattedDateRange,
    historyType,
    categorizedItems,
    loggedInUserId,
    onError: showSnackbar,
  });

  const isLoading = isLoadingReferenceData || isLoadingHistory;

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
        <TransactionsList
          transactionsByUser={transactionsByUser}
          userList={userList}
          buildings={buildings}
          loggedInUserId={loggedInUserId}
          historyType={historyType}
          userHistory={userHistory}
          singleWelcomeBasketQuantity={singleWelcomeBasketQuantity}
        />
      )}
    </Stack>
  );
};

export default HistoryPage;
