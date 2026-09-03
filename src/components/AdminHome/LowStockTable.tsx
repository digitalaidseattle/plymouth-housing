/**
 *  LowStockTable.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import MainCard from '../MainCard';
import { InventoryItem } from '../../types/interfaces';

interface LowStockTableProps {
  rows: InventoryItem[];
  checkedOutById: Map<number, number>;
}

const LowStockTable: React.FC<LowStockTableProps> = ({
  rows,
  checkedOutById,
}) => (
  <MainCard
    title="Low Stock & High Need"
    secondary={
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        items at or below threshold
      </Typography>
    }
  >
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Current Qty</TableCell>
            <TableCell align="right">Threshold</TableCell>
            <TableCell align="right">Checked Out (This Range)</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">{item.threshold}</TableCell>
              <TableCell align="right">
                {checkedOutById.get(item.id) || '—'}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={item.status}
                  sx={{
                    bgcolor:
                      item.status === 'Out of Stock'
                        ? 'error.lighter'
                        : 'warning.lighter',
                    color:
                      item.status === 'Out of Stock'
                        ? 'error.main'
                        : 'warning.main',
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No items at or below threshold
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </MainCard>
);

export default LowStockTable;
