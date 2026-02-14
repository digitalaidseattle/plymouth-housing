import DialogTemplate from '../DialogTemplate';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { SyntheticEvent, useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ToggleButton, ToggleButtonGroup, Stack } from '@mui/material';

type CustomDateDialogProps = {
  showDialog: boolean;
  handleShowDialog: () => void;
  handleSetDateRange: (startDate: Date, endDate: Date) => void;
  handleSetDateInput: () => void;
};

const CustomDateDialog = ({
  showDialog,
  handleShowDialog,
  handleSetDateRange,
  handleSetDateInput,
}: CustomDateDialogProps) => {
  const today = new Date();
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(today));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs(today));
  const [error, setError] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string>('none');

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (!error) {
      handleSetDateInput();
      handleSetDateRange(startDate.toDate(), endDate.toDate());
      handleShowDialog();
    }
  }

  const errorMessage = useMemo(() => {
    switch (error) {
      case 'minDate': {
        return 'Make sure that the end date is after the start date';
      }

      case 'invalidDate': {
        return 'Your date is not valid';
      }

      default: {
        return '';
      }
    }
  }, [error]);

  return (
    <DialogTemplate
      showDialog={showDialog}
      handleShowDialog={handleShowDialog}
      handleSubmit={handleSubmit}
      submitButtonText="Apply"
      backButtonText="Cancel"
    >
      <h2>Select date range</h2>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Start date"
          value={startDate}
          onChange={(newValue) => {
            setStartDate(newValue);
            setActivePreset('none');
          }}
        />
        <DatePicker
          label="End date"
          value={endDate}
          minDate={startDate}
          onChange={(newValue) => {
            setEndDate(newValue);
            setActivePreset('none');
          }}
          onError={(newError) => setError(newError)}
          slotProps={{
            textField: {
              helperText: errorMessage,
            },
          }}
        />
      </LocalizationProvider>
      <ToggleButtonGroup
        value={activePreset}
        exclusive
        sx={{
          gap: '0.5rem',
          '& .MuiToggleButton-root': {
            borderRadius: '20px !important', // Override grouped styles
            marginLeft: '0 !important',
          },
        }}
        onChange={(_, preset) => {
          if (!preset) return;

          if (preset === 'this-month') {
            const month = dayjs().month();
            const year = dayjs().year();
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);
            setStartDate(dayjs(startOfMonth));
            setEndDate(dayjs(endOfMonth));
          } else if (preset === 'last-month') {
            const month = dayjs().month() - 1;
            const year = dayjs().year();
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);
            setStartDate(dayjs(startOfMonth));
            setEndDate(dayjs(endOfMonth));
          } else if (preset === 'last-30-days') {
            const thirtyDaysAgo = dayjs().subtract(30, 'day');
            setStartDate(dayjs(thirtyDaysAgo));
            setEndDate(dayjs());
          }

          setActivePreset(preset);
        }}
      >
        <ToggleButton
          value="this-month"
          sx={{
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            border: '1px solid',
            borderColor: 'text.primary',
            textTransform: 'none',
            backgroundColor: 'transparent',
            color: 'text.primary',
            '&.Mui-selected': {
              backgroundColor: 'primary.dark',
              color: 'primary.contrastText',
              border: 'none',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
        >
          This month
        </ToggleButton>
        <ToggleButton
          value="last-month"
          sx={{
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            border: '1px solid',
            borderColor: 'text.primary',
            textTransform: 'none',
            backgroundColor: 'transparent',
            color: 'text.primary',
            '&.Mui-selected': {
              backgroundColor: 'primary.dark',
              color: 'primary.contrastText',
              border: 'none',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
        >
          Last month
        </ToggleButton>
        <ToggleButton
          value="last-30-days"
          sx={{
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            border: '1px solid',
            borderColor: 'text.primary',
            textTransform: 'none',
            backgroundColor: 'transparent',
            color: 'text.primary',
            '&.Mui-selected': {
              backgroundColor: 'primary.dark',
              color: 'primary.contrastText',
              border: 'none',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
        >
          Last 30 days
        </ToggleButton>
      </ToggleButtonGroup>
    </DialogTemplate>
  );
};

export default CustomDateDialog;
