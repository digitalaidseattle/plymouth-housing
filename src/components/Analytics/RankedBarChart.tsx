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
  rows: { label: string; value: number; secondaryValue?: number }[];
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
          sx={{
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="h5">{title}</Typography>
          {/* A generated title can run the width of the card, so the column name
              holds its place and the title wraps instead. */}
          <Typography
            sx={{
              typography: 'body2',
              color: 'text.secondary',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
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
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.value}
                  {row.secondaryValue != null && (
                    <Box component="span" sx={{ color: 'text.secondary' }}>
                      {` / ${row.secondaryValue}`}
                    </Box>
                  )}
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
