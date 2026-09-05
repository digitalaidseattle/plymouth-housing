/**
 *  DataTable.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { usePagination } from '../../hooks/usePagination';
import PanelCard from './PanelCard';
import TablePaginationBar from './TablePaginationBar';

export type RowTone = 'critical' | 'warning' | 'notice' | 'good';

const toneBackground: Record<RowTone, string> = {
  critical: 'error.lighter',
  warning: 'warning.lighter',
  notice: 'info.lighter',
  good: 'success.lighter',
};

export type Column<T> = {
  label: string;
  align?: 'left' | 'right';
  render: (row: T) => React.ReactNode;
};

interface DataTableProps<T> {
  title: string;
  action?: React.ReactNode;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => React.Key;
  getRowTone?: (row: T) => RowTone | undefined;
  emptyMessage: string;
  minWidth?: number;
}

const headerSx = { fontWeight: 'bold', whiteSpace: 'nowrap' };

const DataTable = <T,>({
  title,
  action,
  columns,
  rows,
  getRowKey,
  getRowTone,
  emptyMessage,
  minWidth = 650,
}: DataTableProps<T>) => {
  const {
    page,
    rowsPerPage,
    pageCount,
    setPage,
    changeRowsPerPage,
    paginatedRows,
  } = usePagination(rows);

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
        <Typography variant="h5">{title}</Typography>
        {action}
      </Stack>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.label}
                  sx={headerSx}
                  align={column.align ?? 'left'}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => {
              const tone = getRowTone?.(row);
              return (
                <TableRow
                  key={getRowKey(row)}
                  sx={
                    tone ? { backgroundColor: toneBackground[tone] } : undefined
                  }
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.label}
                      align={column.align ?? 'left'}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePaginationBar
        pageCount={pageCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={changeRowsPerPage}
      />
    </PanelCard>
  );
};

export default DataTable;
