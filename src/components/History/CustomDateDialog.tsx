import DialogTemplate from '../DialogTemplate';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { SyntheticEvent, useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

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
          onChange={(newValue) => setStartDate(newValue)}
        />
        <DatePicker
          label="End date"
          value={endDate}
          minDate={startDate}
          onChange={(newValue) => setEndDate(newValue)}
          onError={(newError) => setError(newError)}
          slotProps={{
            textField: {
              helperText: errorMessage,
            },
          }}
        />
      </LocalizationProvider>
    </DialogTemplate>
  );
};

export default CustomDateDialog;
