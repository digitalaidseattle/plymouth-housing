/**
 *  AnalyticsFilters.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { DownloadOutlined } from '@ant-design/icons';
import { Building, DatePreset, DateRange } from '../../types/interfaces';

interface AnalyticsFiltersProps {
  dateInput: DatePreset;
  dateRange: DateRange;
  dateRangeString: string;
  onDateSelect: (preset: DatePreset) => void;
  onOpenCustomDialog: () => void;
  buildings: Building[];
  buildingId: number | null;
  onBuildingChange: (e: SelectChangeEvent<number | 'all'>) => void;
  onExport: () => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  dateInput,
  dateRange,
  dateRangeString,
  onDateSelect,
  onOpenCustomDialog,
  buildings,
  buildingId,
  onBuildingChange,
  onExport,
}) => (
  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
    <Typography variant="body2">Filters</Typography>
    <FormControl sx={{ minWidth: 160 }}>
      <InputLabel id="select-date-label">Date</InputLabel>
      <Select
        labelId="select-date-label"
        id="select-date"
        value={dateInput}
        label="Date"
        onChange={(e) => {
          const value = e.target.value as DatePreset;
          if (value === 'custom') {
            onOpenCustomDialog();
          } else {
            onDateSelect(value);
          }
        }}
      >
        <MenuItem value="this month">This Month</MenuItem>
        <MenuItem value="this week">This Week</MenuItem>
        <MenuItem value="today">Today</MenuItem>
        <MenuItem value="yesterday">Yesterday</MenuItem>
        <MenuItem value="custom">
          {dateRange.isCustom ? dateRangeString : 'Custom'}
        </MenuItem>
      </Select>
    </FormControl>
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel id="select-building-label">Building</InputLabel>
      <Select
        labelId="select-building-label"
        id="select-building"
        value={buildingId ?? 'all'}
        label="Building"
        onChange={onBuildingChange}
      >
        <MenuItem value="all">All Buildings</MenuItem>
        {buildings.map((building) => (
          <MenuItem key={building.id} value={building.id}>
            {building.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <Button
      variant="outlined"
      startIcon={<DownloadOutlined />}
      onClick={onExport}
      sx={{ marginLeft: 'auto' }}
    >
      Export CSV
    </Button>
  </Stack>
);

export default AnalyticsFilters;
