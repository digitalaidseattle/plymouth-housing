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
    isLoading: isLoadingReferenceData,
  } = useReferenceData({ user, onError: showSnackbar });

  const [historyType, setHistoryType] = useState<'checkout' | 'inventory'>(
    'checkout',
  );

  const { transactionsByUser, isLoading: isLoadingHistory } = useHistoryData({
    user,
    formattedDateRange,
    historyType,
    loggedInUserId,
    onError: showSnackbar,
  });

  const isLoading = isLoadingReferenceData || isLoadingHistory;

  return (
    <Stack sx={{ gap: 4, paddingY: 5 }}>
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

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <ToggleButtonGroup
          value={historyType}
          exclusive
          onChange={(_, newType) => newType && setHistoryType(newType)}
          sx={{
            gap: 2,
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
              py: 2,
              px: 4,
              borderRadius: '18px',
              fontSize: (theme) => theme.typography.h5.fontSize,
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
              py: 2,
              px: 4,
              borderRadius: '18px',
              fontSize: (theme) => theme.typography.h5.fontSize,
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

      <Stack>
        <Typography variant="h2" sx={{ textTransform: 'capitalize' }}>
          {dateRange.isCustom ? dateRangeString : dateInput}
        </Typography>
        {dateInput === 'custom' ? (
          <Button onClick={toggleCustomDateDialog}>Change date range</Button>
        ) : (
          <Typography variant="body1">
            {dateInput !== 'this week' ? dateString : dateRangeString}
          </Typography>
        )}
        {!isLoading && (() => {
          const totalRecords = transactionsByUser.reduce(
            (sum, user) => sum + user.transactions.length,
            0,
          );
          return (
            <Typography variant="body1">
              Showing {totalRecords} {totalRecords === 1 ? 'record' : 'records'} total
            </Typography>
          );
        })()}
      </Stack>
      {isLoading ? (
        <CircularLoader />
      ) : (
        <>
          <TransactionsList
            transactionsByUser={transactionsByUser}
            userList={userList}
            buildings={buildings}
            loggedInUserId={loggedInUserId}
            historyType={historyType}
          />
        </>
      )}
    </Stack>
  );
};

export default HistoryPage;
