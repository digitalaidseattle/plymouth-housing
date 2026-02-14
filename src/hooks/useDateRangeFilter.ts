import { useState, useMemo, useCallback } from 'react';
import { formatDateRange, formatFullDate } from '../components/History/historyUtils';

export type DatePreset = 'today' | 'yesterday' | 'this week' | 'custom';

interface DateRange {
  startDate: Date;
  endDate: Date;
  isCustom?: boolean;
}

export function useDateRangeFilter() {
  const todaysDate = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: todaysDate,
    endDate: todaysDate,
  });
  const [dateInput, setDateInput] = useState<DatePreset>('today');
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);

  const formattedDateRange = useMemo(
    () => ({
      startDate: dateRange.startDate.toLocaleDateString('en-CA'),
      endDate: dateRange.endDate.toLocaleDateString('en-CA'),
    }),
    [dateRange],
  );

  const dateString = formatFullDate(dateRange.startDate);
  const dateRangeString = formatDateRange(
    dateRange.startDate,
    dateRange.endDate,
  );

  const handleDateSelection = useCallback((preset: DatePreset) => {
    const todaysDate = new Date();
    setDateInput(preset);

    if (preset === 'today') {
      setDateRange({
        startDate: todaysDate,
        endDate: todaysDate,
      });
    } else if (preset === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(todaysDate.getDate() - 1);
      setDateRange({
        startDate: yesterday,
        endDate: yesterday,
      });
    } else if (preset === 'this week') {
      const lastWeekDate = new Date();
      lastWeekDate.setDate(todaysDate.getDate() - 7);
      setDateRange({
        startDate: lastWeekDate,
        endDate: todaysDate,
      });
    }
  }, []);

  const handleSetCustomDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      setDateRange({
        startDate,
        endDate,
        isCustom: true,
      });
      setDateInput('custom');
    },
    [],
  );

  const toggleCustomDateDialog = useCallback(() => {
    setShowCustomDateDialog((prev) => !prev);
  }, []);

  return {
    dateRange,
    dateInput,
    showCustomDateDialog,
    formattedDateRange,
    dateString,
    dateRangeString,
    handleDateSelection,
    handleSetCustomDateRange,
    toggleCustomDateDialog,
  };
}
