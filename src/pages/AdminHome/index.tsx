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
  formatSignedTotal,
  formatTransactionDate,
  percentChange,
  previousPeriod,
  sortLowStockItems,
  sumItemsAdded,
  summarizeCheckouts,
  topItemsAdded,
} from '../../utils/analyticsUtils';
import { downloadCsv, downloadCsvSections } from '../../utils/csvExport';

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
    inventoryAdds,
    previousInventoryAdds,
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

  const topInventoryAdded = useMemo(
    () => topItemsAdded(inventoryAdds, 10),
    [inventoryAdds],
  );

  const itemsAdded = useMemo(
    () => sumItemsAdded(inventoryAdds),
    [inventoryAdds],
  );
  const previousItemsAdded = useMemo(
    () => sumItemsAdded(previousInventoryAdds),
    [previousInventoryAdds],
  );

  // Nothing in the current range means nothing to compare against.
  const deltaVsPrevious = (current: number, previous: number) =>
    hasData ? percentChange(current, previous) : null;

  const statTiles = [
    {
      label: 'Residents Served',
      value: String(currentSummary.residentsServed),
      delta: deltaVsPrevious(
        currentSummary.residentsServed,
        previousSummary.residentsServed,
      ),
      caption: 'Unique residents with at least one checkout',
    },
    {
      label: 'Checkouts',
      value: String(currentSummary.checkouts),
      // A per-day average only means something once the range covers more
      // than a single day.
      valueSuffix:
        currentSummary.rangeDays > 1
          ? `${currentSummary.avgCheckoutsPerDay.toFixed(1)} / day`
          : undefined,
      delta: deltaVsPrevious(
        currentSummary.checkouts,
        previousSummary.checkouts,
      ),
      caption: 'Totals for the selected range',
    },
    {
      label: 'Items Checked Out',
      value: formatSignedTotal(currentSummary.itemsCheckedOut, '-'),
      delta: deltaVsPrevious(
        currentSummary.itemsCheckedOut,
        previousSummary.itemsCheckedOut,
      ),
      caption: 'Total item count across all checkouts',
    },
    {
      label: 'Items Added',
      value: formatSignedTotal(itemsAdded, '+'),
      // Gated on its own total, not on checkouts: a range can take stock in
      // without a single checkout going out.
      delta:
        itemsAdded > 0 ? percentChange(itemsAdded, previousItemsAdded) : null,
      caption: 'Total quantity added to inventory',
    },
  ];

  const handleBuildingChange = (e: SelectChangeEvent<number | 'all'>) => {
    const value = e.target.value;
    setBuildingId(value === 'all' ? null : Number(value));
  };

  const selectedBuildingName =
    buildings.find((building) => building.id === buildingId)?.name ??
    'All Buildings';

  // One workbook of every panel currently on screen, section by section.
  const handleExportCsv = () => {
    downloadCsvSections('analytics-report.csv', [
      {
        title: 'Filters',
        headers: ['Field', 'Value'],
        rows: [
          ['Date range', dateRangeString],
          ['Building', selectedBuildingName],
          ['Repeats only', repeatsOnly ? 'Yes' : 'No'],
        ],
      },
      {
        title: 'Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Residents Served', String(currentSummary.residentsServed)],
          ['Total Checkouts', String(currentSummary.checkouts)],
          ['Avg Checkouts / Day', currentSummary.avgCheckoutsPerDay.toFixed(1)],
          ['Items Checked Out', String(currentSummary.itemsCheckedOut)],
          ['Items Added', String(itemsAdded)],
        ],
      },
      {
        title: 'Residents Served by Building',
        headers: ['Building', 'Residents'],
        rows: residentsByBuilding.map((building) => [
          building.building_code,
          building.residentCount,
        ]),
      },
      {
        title: 'Top 10 Items Checked Out',
        headers: ['Item', 'Quantity'],
        rows: itemTotals
          .slice(0, 10)
          .map((item) => [item.item_name, item.total_quantity]),
      },
      {
        title: 'Top 10 Inventory Items Added',
        headers: ['Item', 'Quantity Added'],
        rows: topInventoryAdded.map((item) => [
          item.item_name,
          item.total_quantity,
        ]),
      },
      {
        title: 'Residents Served',
        headers: [
          'Resident',
          'Building',
          'Unit',
          '# Items',
          'Transaction Date',
          'Repeat',
        ],
        rows: detailRows.map((row) => [
          row.resident_name,
          row.building_code,
          row.unit_number.trim() || '-',
          row.total_quantity,
          formatTransactionDate(row.transaction_date),
          row.isDuplicate ? 'Yes' : '',
        ]),
      },
      {
        title: 'Low Stock & High Need',
        headers: [
          'Item',
          'Category',
          'Current Qty',
          'Threshold',
          'Checked Out',
          'Status',
        ],
        rows: lowStockRows.map((item) => [
          item.name,
          item.category,
          item.quantity,
          item.threshold,
          itemTotalsById.get(item.id) ?? 0,
          item.status,
        ]),
      },
    ]);
  };

  const handleExportInventoryCsv = () => {
    downloadCsv(
      'current-inventory.csv',
      ['Item', 'Category', 'Type', 'Current Qty', 'Threshold', 'Status'],
      items.map((item) => [
        item.name,
        item.category,
        item.type,
        item.quantity,
        item.threshold,
        item.status,
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
        onExportInventory={handleExportInventoryCsv}
        lastUpdated={lastUpdated}
        isRefreshing={isLoading}
        onRefresh={refresh}
      />

      <Grid container spacing={3}>
        {isLoading
          ? [0, 1, 2, 3].map((key) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
                <Skeleton variant="rounded" height={140} />
              </Grid>
            ))
          : statTiles.map((tile) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tile.label}>
                <StatTile {...tile} />
              </Grid>
            ))}
      </Grid>

      <Grid container spacing={3}>
        {isLoading ? (
          [0, 1, 2].map((key) => (
            <Grid size={{ xs: 12, lg: 4 }} key={key}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, lg: 4 }}>
              <RankedBarChart
                title="Residents Served by Building"
                hint="unique residents"
                emptyMessage="No checkouts in this range"
                rows={residentsByBuilding.map((building) => ({
                  label: building.building_code,
                  value: building.residentCount,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <RankedBarChart
                title="Top 10 Items Checked Out"
                hint="by item count"
                emptyMessage="No checkouts in this range"
                rows={itemTotals.slice(0, 10).map((item) => ({
                  label: item.item_name,
                  value: item.total_quantity,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <RankedBarChart
                title="Top 10 Inventory Items Added"
                hint="by quantity"
                emptyMessage="No inventory added in this range"
                rows={topInventoryAdded.map((item) => ({
                  label: item.item_name,
                  value: item.total_quantity,
                }))}
              />
            </Grid>
          </>
        )}
      </Grid>

      {isLoading ? (
        <Skeleton variant="rounded" height={420} />
      ) : (
        <ResidentsDetailTable
          rows={detailRows}
          repeatsOnly={repeatsOnly}
          onRepeatsOnlyChange={setRepeatsOnly}
        />
      )}

      {isLoading ? (
        <Skeleton variant="rounded" height={320} />
      ) : (
        <LowStockTable rows={lowStockRows} checkedOutById={itemTotalsById} />
      )}
    </Stack>
  );
};

export default AdminHome;
