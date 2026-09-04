/**
 *  useDateRangeFilter.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useMemo, useCallback } from 'react';
import {
  formatDateRange,
  formatFullDate,
} from '../components/History/historyUtils';
import { DatePreset, DateRange } from '../types/interfaces';

export type { DatePreset };

type SelectablePreset = Exclude<DatePreset, 'custom'>;

function dateRangeForPreset(preset: SelectablePreset): DateRange {
  const todaysDate = new Date();

  if (preset === 'yesterday') {
    const yesterday = new Date();
    yesterday.setDate(todaysDate.getDate() - 1);
    return { startDate: yesterday, endDate: yesterday };
  }
  if (preset === 'this week') {
    const lastWeekDate = new Date();
    lastWeekDate.setDate(todaysDate.getDate() - 7);
    return { startDate: lastWeekDate, endDate: todaysDate };
  }
  if (preset === 'this month') {
    const firstOfMonth = new Date(
      todaysDate.getFullYear(),
      todaysDate.getMonth(),
      1,
    );
    return { startDate: firstOfMonth, endDate: todaysDate };
  }
  return { startDate: todaysDate, endDate: todaysDate };
}

export function useDateRangeFilter() {
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    dateRangeForPreset('today'),
  );
  const [dateInput, setDateInput] = useState<DatePreset>('today');
  const [showCustomDateDialog, setShowCustomDateDialog] = useState(false);

  const formattedDateRange = useMemo(() => {
    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [dateRange]);

  const dateString = formatFullDate(dateRange.startDate);
  const dateRangeString = formatDateRange(
    dateRange.startDate,
    dateRange.endDate,
  );

  const handleDateSelection = useCallback((preset: DatePreset) => {
    setDateInput(preset);
    if (preset !== 'custom') {
      setDateRange(dateRangeForPreset(preset));
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
