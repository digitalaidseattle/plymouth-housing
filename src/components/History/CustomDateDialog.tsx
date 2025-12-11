import DialogTemplate from '../DialogTemplate';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { SyntheticEvent, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

type CustomDateDialogProps = {
  showDialog: boolean;
  handleShowDialog: () => void;
  handleSetDateRange: (startDate: Date, endDate: Date) => void;
};

const CustomDateDialog = ({
  showDialog,
  handleShowDialog,
  handleSetDateRange,
}: CustomDateDialogProps) => {
  const today = new Date();
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(today));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs(today));

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    handleSetDateRange(startDate.toDate(), endDate.toDate());
    //  TODO: validate input, show error
    handleShowDialog();
  }

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
          onChange={(newValue) => setEndDate(newValue)}
        />
      </LocalizationProvider>
    </DialogTemplate>
  );
};

export default CustomDateDialog;
