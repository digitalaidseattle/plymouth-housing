/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useContext, useMemo, useState } from 'react';
import { Grid, SelectChangeEvent, Skeleton, Stack } from '@mui/material';
import { UserContext } from '../../components/contexts/UserContext';
import CustomDateDialog from '../../components/History/CustomDateDialog';
import SnackbarAlert from '../../components/SnackbarAlert';
import StatTile from '../../components/AdminHome/StatTile';
import RankedBarChart from '../../components/AdminHome/RankedBarChart';
import AnalyticsFilters from '../../components/AdminHome/AnalyticsFilters';
import LowStockTable from '../../components/AdminHome/LowStockTable';
import ResidentsDetailTable from '../../components/AdminHome/ResidentsDetailTable';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useDateRangeFilter } from '../../hooks/useDateRangeFilter';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import {
  countResidentsByBuilding,
  flagDuplicates,
  formatTransactionDate,
  percentChange,
  previousPeriod,
  sortLowStockItems,
  summarizeCheckouts,
} from '../../utils/analyticsUtils';
import { downloadCsv } from '../../utils/csvExport';

const AdminHome: React.FC = () => {
  const { user } = useContext(UserContext);
  const { snackbarState, showSnackbar, handleClose } = useSnackbar();
  const {
    dateInput,
    dateRange,
    showCustomDateDialog,
    formattedDateRange,
    dateRangeString,
    handleDateSelection,
    handleSetCustomDateRange,
    toggleCustomDateDialog,
  } = useDateRangeFilter();
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [repeatsOnly, setRepeatsOnly] = useState(false);

  const {
    currentRows,
    previousRows,
    itemTotals,
    items,
    buildings,
    isLoading,
    lastUpdated,
    refresh,
  } = useAnalyticsData({
    user,
    formattedDateRange,
    buildingId,
    onError: showSnackbar,
  });

  const currentSummary = useMemo(
    () =>
      summarizeCheckouts(
        currentRows,
        formattedDateRange.startDate,
        formattedDateRange.endDate,
      ),
    [currentRows, formattedDateRange.startDate, formattedDateRange.endDate],
  );
  const previous = previousPeriod(
    formattedDateRange.startDate,
    formattedDateRange.endDate,
  );
  const previousSummary = useMemo(
    () =>
      summarizeCheckouts(previousRows, previous.startDate, previous.endDate),
    [previousRows, previous.startDate, previous.endDate],
  );
  const hasData = currentSummary.checkouts > 0;

  const itemTotalsById = useMemo(
    () =>
      new Map(itemTotals.map((total) => [total.item_id, total.total_quantity])),
    [itemTotals],
  );
  const lowStockRows = useMemo(() => sortLowStockItems(items), [items]);

  const flaggedRows = useMemo(() => flagDuplicates(currentRows), [currentRows]);
  // Memoized so the detail table's page reset only fires when the rows change.
  const detailRows = useMemo(
    () =>
      repeatsOnly ? flaggedRows.filter((row) => row.isDuplicate) : flaggedRows,
    [flaggedRows, repeatsOnly],
  );

  const residentsByBuilding = useMemo(
    () => countResidentsByBuilding(currentRows),
    [currentRows],
  );

  const statTiles = [
    {
      label: 'Residents Served',
      value: String(currentSummary.residentsServed),
      delta: hasData
        ? percentChange(
            currentSummary.residentsServed,
            previousSummary.residentsServed,
          )
        : null,
      caption: 'Unique residents with at least one checkout',
    },
    {
      label: 'Avg Checkouts / Day',
      value: currentSummary.avgCheckoutsPerDay.toFixed(1),
      delta: hasData
        ? percentChange(
            currentSummary.avgCheckoutsPerDay,
            previousSummary.avgCheckoutsPerDay,
          )
        : null,
      caption: 'Across all buildings and voucher programs',
    },
    {
      label: 'Items Checked Out',
      value: String(currentSummary.itemsCheckedOut),
      delta: hasData
        ? percentChange(
            currentSummary.itemsCheckedOut,
            previousSummary.itemsCheckedOut,
          )
        : null,
      caption: 'Total item count across all checkouts',
    },
  ];

  const handleBuildingChange = (e: SelectChangeEvent<number | 'all'>) => {
    const value = e.target.value;
    setBuildingId(value === 'all' ? null : Number(value));
  };

  const handleExportCsv = () => {
    downloadCsv(
      'residents-served.csv',
      ['Resident', 'Building', 'Unit', '# Items', 'Transaction Date', 'Repeat'],
      detailRows.map((row) => [
        row.resident_name,
        row.building_code,
        row.unit_number.trim() || '-',
        row.total_quantity,
        formatTransactionDate(row.transaction_date),
        row.isDuplicate ? 'Yes' : '',
      ]),
    );
  };

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

      <AnalyticsFilters
        dateInput={dateInput}
        dateRange={dateRange}
        dateRangeString={dateRangeString}
        onDateSelect={handleDateSelection}
        onOpenCustomDialog={toggleCustomDateDialog}
        buildings={buildings}
        buildingId={buildingId}
        onBuildingChange={handleBuildingChange}
        onExport={handleExportCsv}
        lastUpdated={lastUpdated}
        isRefreshing={isLoading}
        onRefresh={refresh}
      />

      <Grid container spacing={3}>
        {isLoading
          ? [0, 1, 2].map((key) => (
              <Grid size={{ xs: 12, md: 4 }} key={key}>
                <Skeleton variant="rounded" height={140} />
              </Grid>
            ))
          : statTiles.map((tile) => (
              <Grid size={{ xs: 12, md: 4 }} key={tile.label}>
                <StatTile {...tile} />
              </Grid>
            ))}
      </Grid>

      <Grid container spacing={3}>
        {isLoading ? (
          [0, 1].map((key) => (
            <Grid size={{ xs: 12, lg: 6 }} key={key}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, lg: 6 }}>
              <RankedBarChart
                title="Top 10 Items Checked Out"
                hint="by item count"
                rows={itemTotals.slice(0, 10).map((item) => ({
                  label: item.item_name,
                  value: item.total_quantity,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <RankedBarChart
                title="Residents Served by Building"
                hint="unique residents"
                rows={residentsByBuilding.map((building) => ({
                  label: building.building_code,
                  value: building.residentCount,
                }))}
              />
            </Grid>
          </>
        )}
      </Grid>

      {isLoading ? (
        <Skeleton variant="rounded" height={320} />
      ) : (
        <LowStockTable rows={lowStockRows} checkedOutById={itemTotalsById} />
      )}

      {isLoading ? (
        <Skeleton variant="rounded" height={420} />
      ) : (
        <ResidentsDetailTable
          rows={detailRows}
          repeatsOnly={repeatsOnly}
          onRepeatsOnlyChange={setRepeatsOnly}
        />
      )}
    </Stack>
  );
};

export default AdminHome;
