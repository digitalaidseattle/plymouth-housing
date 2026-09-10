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
import StatTile from '../../components/Analytics/StatTile';
import RankedBarChart from '../../components/Analytics/RankedBarChart';
import AnalyticsFilters from '../../components/Analytics/AnalyticsFilters';
import LowStockTable from '../../components/Analytics/LowStockTable';
import ResidentsDetailTable from '../../components/Analytics/ResidentsDetailTable';
import { useDateRangeFilter } from '../../hooks/useDateRangeFilter';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import {
  buildAnalyticsSections,
  countResidentsByBuilding,
  flagDuplicates,
  percentChange,
  sortLowStockItems,
  sumItemsAdded,
  summarizeCheckouts,
  topItemsAdded,
} from '../../utils/analyticsUtils';
import { downloadCsv, downloadCsvSections } from '../../utils/csvExport';

interface AnalyticsProps {
  onError: (message: string) => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ onError }) => {
  const { user } = useContext(UserContext);

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
    previousRange,
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
    onError,
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
  const previousSummary = useMemo(
    () =>
      summarizeCheckouts(
        previousRows,
        previousRange.startDate,
        previousRange.endDate,
      ),
    [previousRows, previousRange],
  );
  const hasData = currentSummary.checkouts > 0;

  const itemTotalsById = useMemo(
    () =>
      new Map(itemTotals.map((total) => [total.item_id, total.total_quantity])),
    [itemTotals],
  );
  const lowStockRows = useMemo(() => sortLowStockItems(items), [items]);

  const flaggedRows = useMemo(() => flagDuplicates(currentRows), [currentRows]);
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

  // Every item with its checkouts for the range, so items that never moved still appear.
  const itemUsage = useMemo(
    () =>
      items
        .map((item) => ({
          item_name: item.name,
          total_quantity: itemTotalsById.get(item.id) ?? 0,
        }))
        .sort(
          (a, b) =>
            b.total_quantity - a.total_quantity ||
            a.item_name.localeCompare(b.item_name),
        ),
    [items, itemTotalsById],
  );

  const topCheckedOutItems = useMemo(
    () => itemTotals.slice(0, 10),
    [itemTotals],
  );

  const leastCheckedOutItems = useMemo(
    () => itemUsage.slice(-10).reverse(),
    [itemUsage],
  );

  const itemsAdded = useMemo(
    () => sumItemsAdded(inventoryAdds),
    [inventoryAdds],
  );
  const previousItemsAdded = useMemo(
    () => sumItemsAdded(previousInventoryAdds),
    [previousInventoryAdds],
  );

  // Nothing in the current range means nothing to compare against. Each tile passes
  // its own test, because stock can come in on a day with no checkouts going out.
  const delta = (current: number, previous: number, hasCurrent: boolean) =>
    hasCurrent ? percentChange(current, previous) : null;

  const statTiles = [
    {
      label: 'Residents Served',
      value: String(currentSummary.residentsServed),
      delta: delta(
        currentSummary.residentsServed,
        previousSummary.residentsServed,
        hasData,
      ),
      caption: 'Unique residents with at least one checkout',
    },
    {
      label: 'Checkouts',
      value: String(currentSummary.checkouts),
      // Only meaningful once the range covers more than a day.
      valueSuffix:
        currentSummary.rangeDays > 1
          ? `${currentSummary.avgCheckoutsPerActiveDay.toFixed(1)} / active day`
          : undefined,
      delta: delta(
        currentSummary.checkouts,
        previousSummary.checkouts,
        hasData,
      ),
      caption: 'Totals for the selected range',
    },
    {
      label: 'Items Checked Out',
      value: String(currentSummary.itemsCheckedOut),
      delta: delta(
        currentSummary.itemsCheckedOut,
        previousSummary.itemsCheckedOut,
        hasData,
      ),
      caption: 'Total item count across all checkouts',
    },
    {
      label: 'Items Added',
      value: String(itemsAdded),
      delta: delta(itemsAdded, previousItemsAdded, itemsAdded > 0),
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

  const handleExportCsv = () => {
    downloadCsvSections(
      'analytics-report.csv',
      buildAnalyticsSections({
        dateRangeString,
        buildingName: selectedBuildingName,
        repeatsOnly,
        statTiles,
        avgCheckoutsPerActiveDay:
          currentSummary.rangeDays > 1
            ? currentSummary.avgCheckoutsPerActiveDay.toFixed(1)
            : undefined,
        residentsByBuilding,
        topCheckedOutItems,
        topInventoryAdded,
        leastCheckedOutItems,
        detailRows,
        lowStockRows,
        checkedOutById: itemTotalsById,
      }),
    );
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
        activeDays={currentSummary.activeDays}
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
          [0, 1, 2, 3].map((key) => (
            <Grid size={{ xs: 12, md: 6 }} key={key}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <RankedBarChart
                title="Residents Served by Building"
                hint="residents / visits"
                emptyMessage="No checkouts in the selected date range. Try a wider range or a different building."
                rows={residentsByBuilding.map((building) => ({
                  label: building.building_code,
                  value: building.residentCount,
                  secondaryValue: building.visitCount,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RankedBarChart
                title="Top 10 Items Checked Out"
                hint="by item count"
                emptyMessage="No checkouts in the selected date range. Try a wider range or a different building."
                rows={topCheckedOutItems.map((item) => ({
                  label: item.item_name,
                  value: item.total_quantity,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RankedBarChart
                title="Top 10 Inventory Items Added"
                hint="by quantity"
                emptyMessage="No inventory added in the selected date range. Try a wider range."
                rows={topInventoryAdded.map((item) => ({
                  label: item.item_name,
                  value: item.total_quantity,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RankedBarChart
                title="Least Checked Out Items"
                hint="0 = never checked out"
                emptyMessage="No inventory items to show."
                rows={leastCheckedOutItems.map((item) => ({
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

export default Analytics;
