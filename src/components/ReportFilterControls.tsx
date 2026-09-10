/**
 *  ReportFilterControls.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Building, DatePreset, DateRange } from '../types/interfaces';

type ReportFilterControlsProps = {
  dateInput: DatePreset;
  dateRange: DateRange;
  dateRangeString: string;
  dateSummaryId?: string;
  onDateSelect: (preset: DatePreset) => void;
  onOpenCustomDialog: () => void;
  buildings: Building[] | null;
  buildingId: number | 'all';
  onBuildingChange: (buildingId: number | 'all') => void;
  showBuilding?: boolean;
};

const ReportFilterControls: React.FC<ReportFilterControlsProps> = ({
  dateInput,
  dateRange,
  dateRangeString,
  dateSummaryId,
  onDateSelect,
  onOpenCustomDialog,
  buildings,
  buildingId,
  onBuildingChange,
  showBuilding = true,
}) => (
  <>
    <FormControl sx={{ flexShrink: 0 }}>
      <InputLabel id="select-date-label">Date</InputLabel>
      <Select
        labelId="select-date-label"
        id="select-date"
        value={dateInput}
        label="Date"
        SelectDisplayProps={
          dateSummaryId ? { 'aria-describedby': dateSummaryId } : undefined
        }
        onChange={(event) => {
          const preset = event.target.value as DatePreset;
          if (preset === 'custom') {
            onOpenCustomDialog();
          } else {
            onDateSelect(preset);
          }
        }}
        sx={(theme) => ({
          width: { xs: '100%', sm: theme.spacing(20) },
          borderRadius: theme.spacing(2.25),
          '& .MuiSelect-select': { py: 2 },
        })}
      >
        <MenuItem value="today">Today</MenuItem>
        <MenuItem value="yesterday">Yesterday</MenuItem>
        <MenuItem value="this week">This Week</MenuItem>
        <MenuItem value="this month">This Month</MenuItem>
        <MenuItem value="last month">Last Month</MenuItem>
        <MenuItem value="last 30 days">Last 30 Days</MenuItem>
        <MenuItem value="this year">This Year</MenuItem>
        <MenuItem value="last year">Last Year</MenuItem>
        <MenuItem value="custom">
          {dateRange.isCustom ? dateRangeString : 'Custom'}
        </MenuItem>
      </Select>
    </FormControl>
    {showBuilding && (
      <FormControl sx={{ flexShrink: 0 }}>
        <InputLabel id="select-building-label">Building</InputLabel>
        <Select
          labelId="select-building-label"
          id="select-building"
          value={buildingId}
          label="Building"
          onChange={(event) => {
            const value = event.target.value;
            onBuildingChange(value === 'all' ? 'all' : Number(value));
          }}
          sx={(theme) => ({
            width: { xs: '100%', sm: 'auto' },
            minWidth: theme.spacing(24),
            borderRadius: theme.spacing(2.25),
            '& .MuiSelect-select': { py: 2 },
          })}
        >
          <MenuItem value="all">All Buildings</MenuItem>
          {buildings?.map((building) => (
            <MenuItem key={building.id} value={building.id}>
              {building.code} — {building.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )}
  </>
);

export default ReportFilterControls;
