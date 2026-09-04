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
  TableRow,
  Typography,
} from '@mui/material';
import { CheckoutTransaction } from '../../types/interfaces';
import { formatTransactionDate } from '../../utils/analyticsUtils';
import { usePagination } from '../../hooks/usePagination';
import PanelCard from './PanelCard';
import TablePaginationBar from './TablePaginationBar';

interface ResidentsDetailTableProps {
  rows: (CheckoutTransaction & { isDuplicate: boolean; visitCount: number })[];
  repeatsOnly: boolean;
  onRepeatsOnlyChange: (checked: boolean) => void;
}

const headerSx = { fontWeight: 'bold', whiteSpace: 'nowrap' };

const ResidentsDetailTable: React.FC<ResidentsDetailTableProps> = ({
  rows,
  repeatsOnly,
  onRepeatsOnlyChange,
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
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5">Residents Served</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={repeatsOnly}
              onChange={(_, checked) => onRepeatsOnlyChange(checked)}
            />
          }
          label="Repeats only"
        />
      </Stack>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headerSx}>Resident</TableCell>
              <TableCell sx={headerSx}>Building</TableCell>
              <TableCell sx={headerSx}>Unit</TableCell>
              <TableCell sx={headerSx} align="right">
                # Visits
              </TableCell>
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
                <TableCell align="right">{row.visitCount}</TableCell>
                <TableCell align="right">{row.total_quantity}</TableCell>
                <TableCell>
                  {formatTransactionDate(row.transaction_date)}
                </TableCell>
              </TableRow>
            ))}
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No checkouts in this range
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

export default ResidentsDetailTable;
