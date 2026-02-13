import DialogTemplate from '../DialogTemplate';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { SyntheticEvent, useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button, Stack } from '@mui/material';

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
            if (newValue) {
              setStartDate(newValue);
              setActivePreset('none');
            }
          }}
        />
        <DatePicker
          label="End date"
          value={endDate}
          minDate={startDate}
          onChange={(newValue) => {
            if (newValue) {
              setEndDate(newValue);
              setActivePreset('none');
            }
          }}
          onError={(newError) => setError(newError ?? '')}
          slotProps={{
            textField: {
              helperText: errorMessage,
            },
          }}
        />
      </LocalizationProvider>
      <Stack flexDirection="row" gap="0.5rem">
        <Button
          variant={activePreset === 'this-month' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => {
            const month = dayjs().month();
            const year = dayjs().year();
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);
            setStartDate(dayjs(startOfMonth));
            setEndDate(dayjs(endOfMonth));
            setActivePreset('this-month');
          }}
        >
          This month
        </Button>
        <Button
          variant={activePreset === 'last-month' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => {
            const month = dayjs().month() - 1;
            const year = dayjs().year();
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);
            setStartDate(dayjs(startOfMonth));
            setEndDate(dayjs(endOfMonth));
            setActivePreset('last-month');
          }}
        >
          Last month
        </Button>
        <Button
          variant={activePreset === 'last-30-days' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => {
            const thirtyDaysAgo = dayjs().subtract(30, 'day');
            setStartDate(dayjs(thirtyDaysAgo));
            setEndDate(dayjs());
            setActivePreset('last-30-days');
          }}
        >
          Last 30 days
        </Button>
      </Stack>
    </DialogTemplate>
  );
};

export default CustomDateDialog;
