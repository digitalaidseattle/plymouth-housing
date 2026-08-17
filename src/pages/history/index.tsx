/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useState, useContext, useEffect } from 'react';
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
import { withCount } from '../../utils/textUtils';

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
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | 'all'>(
    'all',
  );

  useEffect(() => {
    if (historyType === 'inventory') {
      setSelectedBuildingId('all');
    }
  }, [historyType]);

  const hasActiveFilters = dateInput !== 'today' || selectedBuildingId !== 'all';

  const handleResetFilters = () => {
    handleDateSelection('today');
    setSelectedBuildingId('all');
  };

  const { transactionsByUser, isLoading: isLoadingHistory } = useHistoryData({
    user,
    formattedDateRange,
    historyType,
    loggedInUserId,
    selectedBuildingId,
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

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          alignItems: { xs: 'stretch', md: 'center' },
          width: '100%',
          gap: 3,
          flexWrap: 'wrap',
        }}
      >
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
              backgroundColor: 'grey.200',
              color: 'text.primary',
              '&.Mui-selected': {
                backgroundColor: 'grey.700',
                color: 'common.white',
                border: 'none',
                '&:hover': {
                  backgroundColor: 'grey.700',
                },
              },
              '&:hover': {
                backgroundColor: 'grey.300',
              },
            }}
          >
            Checkout
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
              backgroundColor: 'grey.200',
              color: 'text.primary',
              '&.Mui-selected': {
                backgroundColor: 'grey.700',
                color: 'common.white',
                border: 'none',
                '&:hover': {
                  backgroundColor: 'grey.700',
                },
              },
              '&:hover': {
                backgroundColor: 'grey.300',
              },
            }}
          >
            Inventory
          </ToggleButton>
        </ToggleButtonGroup>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
            width: { xs: '100%', md: 'auto' },
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          <FormControl sx={{ flexShrink: 0 }}>
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
              sx={{
                width: { xs: '100%', sm: '10rem' },
                borderRadius: '18px',
                '& .MuiSelect-select': { py: 2 },
              }}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="this week">This Week</MenuItem>
              <MenuItem value="this month">This Month</MenuItem>
              <MenuItem value="last month">Last Month</MenuItem>
              <MenuItem value="last 30 days">Last 30 Days</MenuItem>
              <MenuItem value="custom">
                {dateRange.isCustom ? dateRangeString : 'Custom'}
              </MenuItem>
            </Select>
          </FormControl>
          {historyType === 'checkout' && (
            <FormControl sx={{ flexShrink: 0 }}>
              <InputLabel id="select-building-label">Building</InputLabel>
              <Select
                labelId="select-building-label"
                id="select-building"
                value={selectedBuildingId}
                label="Building"
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedBuildingId(value === 'all' ? 'all' : Number(value));
                }}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: '12rem',
                  borderRadius: '18px',
                  '& .MuiSelect-select': { py: 2 },
                }}
              >
                <MenuItem value="all">All Buildings</MenuItem>
                {buildings?.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.code} — {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {hasActiveFilters && (
            <Button
              onClick={handleResetFilters}
              sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              Reset filters
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack>
        <Typography variant="h2" sx={{ textTransform: 'capitalize' }}>
          {dateRange.isCustom ? dateRangeString : dateInput}
        </Typography>
        {dateInput === 'custom' ? (
          <Button onClick={toggleCustomDateDialog}>Change date range</Button>
        ) : (
          <Typography variant="body1">
            {['this week', 'this month', 'last month', 'last 30 days'].includes(dateInput)
              ? dateRangeString
              : dateString}
          </Typography>
        )}
        {!isLoading && (() => {
          const totalRecords = transactionsByUser.reduce(
            (sum, user) => sum + user.transactions.length,
            0,
          );
          return (
            <Typography variant="body1">
              Showing {withCount(totalRecords, 'record')} total
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
            loggedInUserId={loggedInUserId}
            historyType={historyType}
            hasBuildingFilter={selectedBuildingId !== 'all'}
          />
        </>
      )}
    </Stack>
  );
};

export default HistoryPage;
