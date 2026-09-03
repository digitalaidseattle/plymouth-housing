/**
 *  RankedBarChart.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Fragment } from 'react';
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

interface RankedBarChartProps {
  title: string;
  hint: string;
  rows: { label: string; value: number }[];
}

const RankedBarChart: React.FC<RankedBarChartProps> = ({
  title,
  hint,
  rows,
}) => {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <Card
      variant="outlined"
      sx={{ height: '100%', borderColor: 'grey.300', borderRadius: 3 }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack sx={{ gap: 3 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h5">{title}</Typography>
            <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
              {hint}
            </Typography>
          </Stack>
          {rows.length === 0 ? (
            <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
              No checkouts in this range
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 10rem) 1fr auto',
                alignItems: 'center',
                columnGap: 2,
                rowGap: 2,
              }}
            >
              {rows.map((row) => (
                <Fragment key={row.label}>
                  <Typography
                    sx={{ typography: 'body2' }}
                    noWrap
                    title={row.label}
                  >
                    {row.label}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.max((row.value / maxValue) * 100, 2)}
                    sx={{ height: 10, backgroundColor: 'grey.200' }}
                  />
                  <Typography
                    sx={{
                      typography: 'body2',
                      minWidth: '2.5rem',
                      textAlign: 'right',
                    }}
                  >
                    {row.value}
                  </Typography>
                </Fragment>
              ))}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RankedBarChart;
