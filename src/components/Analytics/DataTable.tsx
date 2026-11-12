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
import { SETTINGS } from '../../types/constants';
import { Column } from '../../types/interfaces';
import PanelCard from './PanelCard';
import TablePaginationBar from './TablePaginationBar';

interface DataTableProps<T> {
  title: string;
  action?: React.ReactNode;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => React.Key;
  getRowHighlight?: (row: T) => boolean;
  emptyMessage: string;
  minWidth?: number;
  // Leaves out the card frame, for a table that sits inside another card.
  bare?: boolean;
}

const headerSx = { fontWeight: 'bold', whiteSpace: 'nowrap' };
const bodyCellSx = { whiteSpace: 'nowrap' };
const ROW_HEIGHT = 53;

const DataTable = <T,>({
  title,
  action,
  columns,
  rows,
  getRowKey,
  getRowHighlight,
  emptyMessage,
  minWidth = 650,
  bare,
}: DataTableProps<T>) => {
  const {
    page,
    rowsPerPage,
    pageCount,
    setPage,
    changeRowsPerPage,
    paginatedRows,
  } = usePagination(rows, SETTINGS.analyticsItemsPerPage);

  const emptyRows = rowsPerPage - paginatedRows.length;

  const table = (
    <>
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
            {paginatedRows.map((row, index) => (
              <TableRow
                key={getRowKey(row, index)}
                sx={
                  getRowHighlight?.(row)
                    ? { backgroundColor: 'warning.lighter' }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.label}
                    align={column.align ?? 'left'}
                    sx={bodyCellSx}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {pageCount > 1 && emptyRows > 0 && paginatedRows.length > 0 && (
              <TableRow sx={{ height: ROW_HEIGHT * emptyRows }}>
                <TableCell colSpan={columns.length} />
              </TableRow>
            )}
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
    </>
  );

  return bare ? table : <PanelCard>{table}</PanelCard>;
};

export default DataTable;
