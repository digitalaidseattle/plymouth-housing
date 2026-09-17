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
  getPresetDateRange,
} from '../components/History/historyUtils';
import { DatePreset, DateRange } from '../types/interfaces';

export type { DatePreset };

export function useDateRangeFilter() {
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getPresetDateRange('today'),
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
      setDateRange(getPresetDateRange(preset));
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
