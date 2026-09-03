/**
 *  AnalyticsFilters.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  Box,
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Building, DatePreset, DateRange } from '../../types/interfaces';
import { formatLastUpdated } from '../../utils/analyticsUtils';

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
  lastUpdated: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

// Pill-shaped filters, matching the rounded cards used across checkout. Grey,
// not blue: the app's buttons and filter controls are black/grey everywhere.
const pillSx = {
  borderRadius: '20px',
  backgroundColor: 'grey.100',
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: '20px',
    borderColor: 'grey.300',
  },
  '& .MuiSelect-select': { py: 1, px: 2 },
};

// Tablet (sm–md) shows the icon only; the label returns on phone and desktop.
const actionLabelSx = { display: { xs: 'inline', sm: 'none', lg: 'inline' } };

const actionButtonSx = {
  whiteSpace: 'nowrap',
  color: 'common.black',
  minWidth: 0,
  '&.Mui-disabled': { color: 'text.disabled' },
  '& .MuiButton-startIcon': {
    mr: { xs: 1, sm: 0, lg: 1 },
    ml: { xs: -0.5, sm: 0, lg: -0.5 },
  },
};

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
  lastUpdated,
  isRefreshing,
  onRefresh,
}) => (
  <Stack
    direction="row"
    sx={{
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      columnGap: 2,
      rowGap: 1.5,
    }}
  >
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        flexWrap: 'wrap',
        columnGap: 2,
        rowGap: 1.5,
      }}
    >
      <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
        Filters
      </Typography>
      <Select
        id="select-date"
        value={dateInput}
        onChange={(e) => {
          const value = e.target.value as DatePreset;
          if (value === 'custom') {
            onOpenCustomDialog();
          } else {
            onDateSelect(value);
          }
        }}
        inputProps={{ 'aria-label': 'Date' }}
        sx={pillSx}
      >
        <MenuItem value="this month">This Month</MenuItem>
        <MenuItem value="this week">This Week</MenuItem>
        <MenuItem value="today">Today</MenuItem>
        <MenuItem value="yesterday">Yesterday</MenuItem>
        <MenuItem value="custom">
          {dateRange.isCustom ? dateRangeString : 'Custom'}
        </MenuItem>
      </Select>
      <Select
        id="select-building"
        value={buildingId ?? 'all'}
        onChange={onBuildingChange}
        inputProps={{ 'aria-label': 'Building' }}
        sx={pillSx}
      >
        <MenuItem value="all">All Buildings</MenuItem>
        {buildings.map((building) => (
          <MenuItem key={building.id} value={building.id}>
            {building.name}
          </MenuItem>
        ))}
      </Select>
    </Stack>
    <Stack
      direction="row"
      sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 1, rowGap: 1 }}
    >
      {lastUpdated !== null && (
        <Typography sx={{ typography: 'caption', color: 'text.secondary' }}>
          Last updated {formatLastUpdated(lastUpdated)}
        </Typography>
      )}
      <Button
        variant="text"
        aria-label="Refresh"
        startIcon={<ReloadOutlined />}
        onClick={onRefresh}
        disabled={isRefreshing}
        sx={actionButtonSx}
      >
        <Box component="span" sx={actionLabelSx}>
          Refresh
        </Box>
      </Button>
      <Button
        variant="text"
        aria-label="Export CSV"
        startIcon={<DownloadOutlined />}
        onClick={onExport}
        sx={actionButtonSx}
      >
        <Box component="span" sx={actionLabelSx}>
          Export CSV
        </Box>
      </Button>
    </Stack>
  </Stack>
);

export default AnalyticsFilters;
