/**
 *  StatTile.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Chip, Stack, Typography } from '@mui/material';
import MainCard from '../MainCard';

interface StatTileProps {
  label: string;
  value: string;
  delta: number | null;
  caption: string;
}

const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  delta,
  caption,
}) => {
  const isPositive = delta !== null && delta >= 0;

  return (
    <MainCard>
      <Stack sx={{ gap: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 'fontWeightMedium' }}>
          {value}
        </Typography>
        {delta !== null && (
          <Chip
            size="small"
            label={`${isPositive ? '↑' : '↓'} ${isPositive ? '+' : ''}${delta}% vs. last month`}
            sx={{
              alignSelf: 'flex-start',
              bgcolor: isPositive ? 'success.lighter' : 'error.lighter',
              color: isPositive ? 'success.main' : 'error.main',
            }}
          />
        )}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {caption}
        </Typography>
      </Stack>
    </MainCard>
  );
};

export default StatTile;
