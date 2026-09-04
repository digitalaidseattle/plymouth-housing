/**
 *  LowStockTable.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { InventoryItem } from '../../types/interfaces';
import { usePagination } from '../../hooks/usePagination';
import PanelCard from './PanelCard';
import TablePaginationBar from './TablePaginationBar';

interface LowStockTableProps {
  rows: InventoryItem[];
  checkedOutById: Map<number, number>;
}

const headerSx = { fontWeight: 'bold', whiteSpace: 'nowrap' };

const statusChipSx: Record<string, { backgroundColor: string; color: string }> = {
  'Needs Review': { backgroundColor: 'error.main', color: 'common.white' },
  'Out of Stock': { backgroundColor: 'error.lighter', color: 'error.dark' },
  'Low Stock': { backgroundColor: 'warning.light', color: 'warning.darker' },
};

const LowStockTable: React.FC<LowStockTableProps> = ({
  rows,
  checkedOutById,
}) => {
  const { page, rowsPerPage, setPage, changeRowsPerPage, paginatedRows } =
    usePagination(rows);

  return (
    <PanelCard>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h5">Low Stock & High Need</Typography>
        <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
          items at or below threshold
        </Typography>
      </Stack>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headerSx}>Item</TableCell>
              <TableCell sx={headerSx}>Category</TableCell>
              <TableCell sx={headerSx}>Status</TableCell>
              <TableCell sx={headerSx} align="right">
                Current Qty
              </TableCell>
              <TableCell sx={headerSx} align="right">
                Threshold
              </TableCell>
              <TableCell sx={headerSx} align="right">
                Checked Out
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    sx={{
                      height: 'auto',
                      borderRadius: 2,
                      ...(statusChipSx[item.status] ?? statusChipSx['Low Stock']),
                      '& .MuiChip-label': { px: 1, py: 0.5 },
                    }}
                  />
                </TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{item.threshold}</TableCell>
                <TableCell align="right">
                  {checkedOutById.get(item.id) || '-'}
                </TableCell>
              </TableRow>
            ))}
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No items at or below threshold
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePaginationBar
        rowCount={rows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={changeRowsPerPage}
      />
    </PanelCard>
  );
};

export default LowStockTable;
