import DialogTemplate from '../DialogTemplate';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { SyntheticEvent, useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ToggleButton, ToggleButtonGroup, styled } from '@mui/material';
import { getPresetDateRange } from './historyUtils';

type CustomDateDialogProps = {
  showDialog: boolean;
  handleShowDialog: () => void;
  handleSetDateRange: (startDate: Date, endDate: Date) => void;
  handleSetDateInput: () => void;
};

const PresetToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: '20px',
  padding: '0.5rem 1rem',
  border: '1px solid',
  borderColor: theme.palette.text.primary,
  textTransform: 'none',
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    border: 'none',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

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
          maxDate={endDate}
          onChange={(newValue) => {
            if (newValue) {
              setStartDate(newValue);
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

          const { startDate, endDate } = getPresetDateRange(preset);
          setStartDate(dayjs(startDate));
          setEndDate(dayjs(endDate));
          setActivePreset(preset);
        }}
      >
        <PresetToggleButton value="this-month">This month</PresetToggleButton>
        <PresetToggleButton value="last-month">Last month</PresetToggleButton>
        <PresetToggleButton value="last-30-days">
          Last 30 days
        </PresetToggleButton>
      </ToggleButtonGroup>
    </DialogTemplate>
  );
};

export default CustomDateDialog;
