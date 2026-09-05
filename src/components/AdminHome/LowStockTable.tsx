/**
 *  LowStockTable.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Chip, Typography } from '@mui/material';
import { InventoryItem } from '../../types/interfaces';
import DataTable, { Column } from './DataTable';

interface LowStockTableProps {
  rows: InventoryItem[];
  checkedOutById: Map<number, number>;
}

const statusChipSx: Record<string, { backgroundColor: string; color: string }> =
  {
    'Needs Review': { backgroundColor: 'error.main', color: 'common.white' },
    'Out of Stock': { backgroundColor: 'error.lighter', color: 'error.dark' },
    'Low Stock': { backgroundColor: 'warning.light', color: 'warning.darker' },
  };

const LowStockTable: React.FC<LowStockTableProps> = ({
  rows,
  checkedOutById,
}) => {
  const columns: Column<InventoryItem>[] = [
    { label: 'Item', render: (item) => item.name },
    { label: 'Category', render: (item) => item.category },
    {
      label: 'Status',
      render: (item) => (
        <Chip
          label={item.status}
          sx={{
            height: 'auto',
            borderRadius: 2,
            ...(statusChipSx[item.status] ?? statusChipSx['Low Stock']),
            '& .MuiChip-label': { px: 1, py: 0.5 },
          }}
        />
      ),
    },
    { label: 'Current Qty', align: 'right', render: (item) => item.quantity },
    { label: 'Threshold', align: 'right', render: (item) => item.threshold },
    {
      label: 'Checked Out',
      align: 'right',
      render: (item) => checkedOutById.get(item.id) || '-',
    },
  ];

  return (
    <DataTable
      title="Low Stock & High Need"
      action={
        <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
          items at or below threshold
        </Typography>
      }
      columns={columns}
      rows={rows}
      getRowKey={(item) => item.id}
      emptyMessage="No items at or below threshold"
      minWidth={700}
    />
  );
};

export default LowStockTable;
