/**
 *  RankedBarChart.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Fragment } from 'react';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import PanelCard from './PanelCard';

interface RankedBarChartProps {
  title: string;
  hint: string;
  emptyMessage: string;
  rows: { label: string; caption?: string; value: number }[];
}

const RankedBarChart: React.FC<RankedBarChartProps> = ({
  title,
  hint,
  emptyMessage,
  rows,
}) => {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <PanelCard fullHeight>
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
            {emptyMessage}
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
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{ typography: 'body2' }}
                    noWrap
                    title={row.label}
                  >
                    {row.label}
                  </Typography>
                  {row.caption && (
                    <Typography
                      sx={{ typography: 'caption', color: 'text.secondary' }}
                      noWrap
                    >
                      {row.caption}
                    </Typography>
                  )}
                </Box>
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
    </PanelCard>
  );
};

export default RankedBarChart;
