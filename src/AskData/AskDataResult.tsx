/**
 *  AskDataResult.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Stack, Typography } from '@mui/material';
import { AskDataAnswer } from '../types/interfaces';
import DataTable from '../components/Analytics/DataTable';
import RankedBarChart from '../components/Analytics/RankedBarChart';

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
    <DataTable
      bare
      title={title}
      action={
        <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
          {answer.truncated ? `First ${rows.length} rows` : explanation}
        </Typography>
      }
      columns={columns.map((column, columnIndex) => ({
        label: column,
        render: (row: AskDataAnswer['rows'][number]) => row[columnIndex],
      }))}
      rows={rows}
      getRowKey={(_, index) => index}
      emptyMessage={EMPTY}
    />
  );
};

export default AskDataResult;
