/**
 *  AnalyticsFilters.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import {
  CaretDownOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
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
  onExportInventory: () => void;
  lastUpdated: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const historySelectSx = {
  borderRadius: '18px',
  '& .MuiSelect-select': { py: 2 },
};

// Tablet (sm–md) shows the icon only; the label returns on phone and desktop.
const actionLabelSx = { display: { xs: 'inline', sm: 'none', lg: 'inline' } };

// 44px keeps the icon-only tablet state a usable touch target.
const actionButtonSx = {
  whiteSpace: 'nowrap',
  color: 'common.black',
  minWidth: { xs: 'auto', sm: 44, lg: 'auto' },
  minHeight: 44,
  '&.Mui-disabled': { color: 'text.disabled' },
  '& .MuiButton-startIcon': {
    mr: { xs: 1, sm: 0, lg: 1 },
    ml: { xs: -0.5, sm: 0, lg: -0.5 },
  },
};

const caretButtonSx = {
  color: 'common.black',
  minWidth: 44,
  minHeight: 44,
  px: 0.5,
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
  onExportInventory,
  lastUpdated,
  isRefreshing,
  onRefresh,
}) => {
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  const runExport = (fn: () => void) => {
    setExportMenuAnchor(null);
    fn();
  };

  return (
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
        <FormControl>
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
            sx={{ ...historySelectSx, width: '10rem' }}
          >
            <MenuItem value="this year">This Year</MenuItem>
            <MenuItem value="last year">Last Year</MenuItem>
            <MenuItem value="this month">This Month</MenuItem>
            <MenuItem value="this week">This Week</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="custom">
              {dateRange.isCustom ? dateRangeString : 'Custom'}
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="select-building-label">Building</InputLabel>
          <Select
            labelId="select-building-label"
            id="select-building"
            value={buildingId ?? 'all'}
            label="Building"
            onChange={onBuildingChange}
            sx={{ ...historySelectSx, minWidth: '12rem' }}
          >
            <MenuItem value="all">All Buildings</MenuItem>
            {buildings.map((building) => (
              <MenuItem key={building.id} value={building.id}>
                {building.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <ButtonGroup variant="text">
          <Button
            aria-label="Export CSV"
            startIcon={<DownloadOutlined />}
            onClick={onExport}
            sx={actionButtonSx}
          >
            <Box component="span" sx={actionLabelSx}>
              Export CSV
            </Box>
          </Button>
          <Button
            aria-label="More export options"
            aria-haspopup="menu"
            aria-expanded={Boolean(exportMenuAnchor)}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={caretButtonSx}
          >
            <CaretDownOutlined />
          </Button>
        </ButtonGroup>
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => runExport(onExport)}>
            Export analytics data
          </MenuItem>
          <MenuItem onClick={() => runExport(onExportInventory)}>
            Export current inventory
          </MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
};

export default AnalyticsFilters;
