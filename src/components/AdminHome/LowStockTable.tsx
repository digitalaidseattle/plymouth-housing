/**
 *  LowStockTable.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Pagination,
  Select,
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
import { SETTINGS } from '../../types/constants';

interface LowStockTableProps {
  rows: InventoryItem[];
  checkedOutById: Map<number, number>;
}

const headerSx = { fontWeight: 'bold', whiteSpace: 'nowrap' };

const LowStockTable: React.FC<LowStockTableProps> = ({
  rows,
  checkedOutById,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    SETTINGS.itemsPerPage,
  );

  useEffect(() => {
    setPage(0);
  }, [rows]);

  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Card variant="outlined" sx={{ borderColor: 'grey.300', borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
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
                        backgroundColor:
                          item.status === 'Out of Stock'
                            ? 'error.lighter'
                            : 'warning.light',
                        color:
                          item.status === 'Out of Stock'
                            ? 'error.dark'
                            : 'warning.darker',
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
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Rows per page:</Typography>
            <Select
              variant="standard"
              sx={{
                '&::before': { borderBottom: 'none' },
                '&:hover:not(.Mui-disabled)::before': { borderBottom: 'none' },
              }}
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              MenuProps={{
                anchorOrigin: { vertical: 'top', horizontal: 'left' },
                transformOrigin: { vertical: 'bottom', horizontal: 'left' },
              }}
            >
              {SETTINGS.rowsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Pagination
            count={Math.max(1, Math.ceil(rows.length / rowsPerPage))}
            page={page + 1}
            onChange={(_, newPage) => setPage(newPage - 1)}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default LowStockTable;
