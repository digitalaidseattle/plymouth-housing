/**
 *  ResidentsDetailTable.tsx
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
  FormControlLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { CheckoutTransaction } from '../../types/interfaces';
import { formatTransactionDate } from '../../utils/analyticsUtils';
import { SETTINGS } from '../../types/constants';

interface ResidentsDetailTableProps {
  rows: (CheckoutTransaction & { isDuplicate: boolean })[];
  repeatsOnly: boolean;
  onRepeatsOnlyChange: (checked: boolean) => void;
}

const headerSx = { fontWeight: 'bold', whiteSpace: 'nowrap' };

const ResidentsDetailTable: React.FC<ResidentsDetailTableProps> = ({
  rows,
  repeatsOnly,
  onRepeatsOnlyChange,
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
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h5">Residents Served Detail</Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={repeatsOnly}
                  onChange={(_, checked) => onRepeatsOnlyChange(checked)}
                />
              }
              label="Repeats only"
            />
            <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
              duplicate residents highlighted
            </Typography>
          </Stack>
        </Stack>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={headerSx}>Resident</TableCell>
                <TableCell sx={headerSx}>Building</TableCell>
                <TableCell sx={headerSx}>Unit</TableCell>
                <TableCell sx={headerSx} align="right">
                  # Items
                </TableCell>
                <TableCell sx={headerSx}>Transaction Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow
                  key={row.transaction_id}
                  sx={
                    row.isDuplicate
                      ? { backgroundColor: 'warning.lighter' }
                      : undefined
                  }
                >
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center' }}
                    >
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
                  </TableCell>
                  <TableCell>{row.building_code}</TableCell>
                  <TableCell>{row.unit_number.trim() || '-'}</TableCell>
                  <TableCell align="right">{row.total_quantity}</TableCell>
                  <TableCell>
                    {formatTransactionDate(row.transaction_date)}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No checkouts in this range
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

export default ResidentsDetailTable;
