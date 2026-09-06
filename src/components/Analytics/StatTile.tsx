/**
 *  StatTile.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Stack, Typography } from '@mui/material';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import PanelCard from './PanelCard';

interface StatTileProps {
  label: string;
  value: string;
  valueSuffix?: string; // e.g. "2.1 / day"
  delta?: number | null;
  caption: string;
}

const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  valueSuffix,
  delta = null,
  caption,
}) => {
  const isPositive = delta !== null && delta >= 0;

  return (
    <PanelCard fullHeight>
      <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
        <Typography
          sx={{
            typography: 'body2',
            color: 'text.secondary',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
          <Typography variant="h1">{value}</Typography>
          {valueSuffix && (
            <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
              {valueSuffix}
            </Typography>
          )}
        </Stack>
        {delta !== null ? (
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              gap: 0.5,
              typography: 'body2',
              py: 0.5,
              px: 1.5,
              borderRadius: 5,
              backgroundColor: isPositive ? 'success.lighter' : 'error.lighter',
              color: isPositive ? 'success.dark' : 'error.dark',
            }}
          >
            {isPositive ? <CaretUpOutlined /> : <CaretDownOutlined />}
            {`${isPositive ? '+' : ''}${delta}% vs. previous period`}
          </Stack>
        ) : (
          // Holds the chip's slot so captions align across every tile.
          <Box sx={{ typography: 'body2', py: 0.5 }}>&nbsp;</Box>
        )}
        <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
          {caption}
        </Typography>
      </Stack>
    </PanelCard>
  );
};

export default StatTile;
