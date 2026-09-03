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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import MainCard from '../MainCard';
import { CheckoutTransaction } from '../../types/interfaces';
import { formatTransactionDate } from '../../utils/analyticsUtils';
import { SETTINGS } from '../../types/constants';

interface ResidentsDetailTableProps {
  rows: (CheckoutTransaction & { isDuplicate: boolean })[];
  repeatsOnly: boolean;
  onRepeatsOnlyChange: (checked: boolean) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const ResidentsDetailTable: React.FC<ResidentsDetailTableProps> = ({
  rows,
  repeatsOnly,
  onRepeatsOnlyChange,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <MainCard
      title="Residents Served — Detail"
      secondary={
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
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            duplicate residents highlighted
          </Typography>
        </Stack>
      }
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Resident</TableCell>
              <TableCell>Building</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell align="right"># Items</TableCell>
              <TableCell>Transaction Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow
                key={row.transaction_id}
                sx={
                  row.isDuplicate ? { bgcolor: 'warning.lighter' } : undefined
                }
              >
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography variant="body2">
                      {row.resident_name}
                    </Typography>
                    {row.isDuplicate && (
                      <Chip
                        size="small"
                        label="Repeat"
                        variant="outlined"
                        sx={{
                          borderColor: 'warning.main',
                          color: 'warning.main',
                        }}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{row.building_code}</TableCell>
                <TableCell>{row.unit_number.trim() || '—'}</TableCell>
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
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange(parseInt(e.target.value, 10))
        }
        rowsPerPageOptions={SETTINGS.rowsPerPageOptions}
      />
    </MainCard>
  );
};

export default ResidentsDetailTable;
