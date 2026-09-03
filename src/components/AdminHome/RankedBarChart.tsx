/**
 *  RankedBarChart.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Grid, LinearProgress, Stack, Typography } from '@mui/material';
import MainCard from '../MainCard';

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
  const maxValue = Math.max(...rows.map((row) => row.value));

  return (
    <MainCard>
      <Stack sx={{ gap: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Typography variant="h5">{title}</Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', marginLeft: 'auto' }}
          >
            {hint}
          </Typography>
        </Stack>
        {rows.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No checkouts in this range
          </Typography>
        ) : (
          <Stack sx={{ gap: 2 }}>
            {rows.map((row) => (
              <Grid
                container
                key={row.label}
                spacing={2}
                sx={{ alignItems: 'center' }}
              >
                <Grid size={3}>
                  <Typography variant="body2">{row.label}</Typography>
                </Grid>
                <Grid size="grow">
                  <LinearProgress
                    variant="determinate"
                    value={Math.max((row.value / maxValue) * 100, 2)}
                  />
                </Grid>
                <Grid size={1}>
                  <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    {row.value}
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Stack>
        )}
      </Stack>
    </MainCard>
  );
};

export default RankedBarChart;
