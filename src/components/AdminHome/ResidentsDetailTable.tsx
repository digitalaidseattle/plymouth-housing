/**
 *  ResidentsDetailTable.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { CheckoutTransaction } from '../../types/interfaces';
import { formatTransactionDate } from '../../utils/analyticsUtils';
import DataTable, { Column } from './DataTable';

type DetailRow = CheckoutTransaction & {
  isDuplicate: boolean;
  visitCount: number;
};

interface ResidentsDetailTableProps {
  rows: DetailRow[];
  repeatsOnly: boolean;
  onRepeatsOnlyChange: (checked: boolean) => void;
}

const columns: Column<DetailRow>[] = [
  {
    label: 'Resident',
    render: (row) => (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography sx={{ typography: 'body2' }}>
          {row.resident_name}
        </Typography>
        {row.isDuplicate && (
          <Chip
            label="Repeat"
            sx={{
              height: 'auto',
              borderRadius: 2,
              backgroundColor: 'warning.light',
              color: 'warning.darker',
              '& .MuiChip-label': { px: 1, py: 0.5 },
            }}
          />
        )}
      </Stack>
    ),
  },
  { label: 'Building', render: (row) => row.building_code },
  { label: 'Unit', render: (row) => row.unit_number.trim() || '-' },
  { label: '# Visits', align: 'right', render: (row) => row.visitCount },
  { label: '# Items', align: 'right', render: (row) => row.total_quantity },
  {
    label: 'Transaction Date',
    render: (row) => formatTransactionDate(row.transaction_date),
  },
];

const ResidentsDetailTable: React.FC<ResidentsDetailTableProps> = ({
  rows,
  repeatsOnly,
  onRepeatsOnlyChange,
}) => (
  <DataTable
    title="Residents Served"
    action={
      <FormControlLabel
        control={
          <Switch
            checked={repeatsOnly}
            onChange={(_, checked) => onRepeatsOnlyChange(checked)}
          />
        }
        label="Repeats only"
      />
    }
    columns={columns}
    rows={rows}
    getRowKey={(row) => row.transaction_id}
    getRowTone={(row) => (row.isDuplicate ? 'warning' : undefined)}
    emptyMessage="No checkouts in this range"
  />
);

export default ResidentsDetailTable;
