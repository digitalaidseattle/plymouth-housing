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
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import {
  CaretDownOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Building, DatePreset, DateRange } from '../../types/interfaces';
import { formatClockTime, formatDateRangeSummary } from '../History/historyUtils';
import ReportFilterControls from '../ReportFilterControls';

interface AnalyticsFiltersProps {
  dateInput: DatePreset;
  dateRange: DateRange;
  dateRangeString: string;
  activeDays: number;
  onDateSelect: (preset: DatePreset) => void;
  onOpenCustomDialog: () => void;
  buildings: Building[];
  buildingId: number | null;
  onBuildingChange: (buildingId: number | 'all') => void;
  onExport: () => void;
  onExportInventory: () => void;
  lastUpdated: number | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

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

const dateSummaryId = 'analytics-date-range';

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
  activeDays,
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
      direction={{ xs: 'column', lg: 'row' }}
      sx={{
        alignItems: { xs: 'stretch', lg: 'flex-start' },
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Stack sx={{ gap: 1 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            flexWrap: 'wrap',
            columnGap: 2,
            rowGap: 1.5,
          }}
        >
          <ReportFilterControls
            dateInput={dateInput}
            dateRange={dateRange}
            dateRangeString={dateRangeString}
            dateSummaryId={dateSummaryId}
            onDateSelect={onDateSelect}
            onOpenCustomDialog={onOpenCustomDialog}
            buildings={buildings}
            buildingId={buildingId ?? 'all'}
            onBuildingChange={onBuildingChange}
          />
        </Stack>
        <Typography
          id={dateSummaryId}
          sx={{ typography: 'caption', color: 'text.secondary' }}
        >
          {formatDateRangeSummary(
            dateRange.startDate,
            dateRange.endDate,
            activeDays,
          )}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: 1,
          rowGap: 1,
        }}
      >
        {lastUpdated !== null && (
          <Typography sx={{ typography: 'caption', color: 'text.secondary' }}>
            Updated {formatClockTime(lastUpdated)}
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
            aria-label="Export"
            startIcon={<DownloadOutlined />}
            onClick={onExport}
            sx={actionButtonSx}
          >
            <Box component="span" sx={actionLabelSx}>
              Export
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
