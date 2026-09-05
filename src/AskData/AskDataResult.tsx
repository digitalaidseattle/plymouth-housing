/**
 *  AskDataResult.tsx
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
import { AskDataAnswer } from '../types/interfaces';
import { usePagination } from '../hooks/usePagination';
import RankedBarChart from '../components/AdminHome/RankedBarChart';
import TablePaginationBar from '../components/AdminHome/TablePaginationBar';

const EMPTY = 'No rows matched';

// The model proposes a display; a result shape that cannot carry it falls back to a table.
const resolveDisplay = ({ display, columns, rows }: AskDataAnswer) => {
  if (display === 'number' && rows.length === 1 && columns.length === 1)
    return 'number';
  if (
    display === 'bar' &&
    columns.length >= 2 &&
    rows.length > 0 &&
    rows.every((row) => typeof row[1] === 'number')
  )
    return 'bar';
  return 'table';
};

const AskDataResult: React.FC<{ answer: AskDataAnswer }> = ({ answer }) => {
  const { title, explanation, columns, rows } = answer;
  const display = resolveDisplay(answer);
  // A new answer brings a new rows array, which sends the table back to page one.
  const { page, rowsPerPage, setPage, changeRowsPerPage, paginatedRows } =
    usePagination(rows);

  if (display === 'number') {
    return (
      <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
        <Typography
          sx={{
            typography: 'body2',
            color: 'text.secondary',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>
        <Typography variant="h1">{rows[0][0]}</Typography>
        <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
          {explanation}
        </Typography>
      </Stack>
    );
  }

  if (display === 'bar') {
    return (
      <RankedBarChart
        bare
        title={title}
        hint={columns[1]}
        emptyMessage={EMPTY}
        rows={rows.map((row) => ({
          label: String(row[0]),
          value: Number(row[1]),
        }))}
      />
    );
  }

  return (
    <Stack sx={{ gap: 2 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h5">{title}</Typography>
        <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
          {answer.truncated ? `First ${rows.length} rows` : explanation}
        </Typography>
      </Stack>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                  sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, rowIndex) => (
              <TableRow key={`${page}-${rowIndex}`}>
                {row.map((value, valueIndex) => (
                  <TableCell key={columns[valueIndex] ?? valueIndex}>
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={Math.max(columns.length, 1)} align="center">
                  {EMPTY}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > 0 && (
        <TablePaginationBar
          rowCount={rows.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={changeRowsPerPage}
        />
      )}
    </Stack>
  );
};

export default AskDataResult;
