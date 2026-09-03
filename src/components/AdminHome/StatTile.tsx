/**
 *  StatTile.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';

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
    <Card
      variant="outlined"
      sx={{ height: '100%', borderColor: 'grey.300', borderRadius: 3 }}
    >
      <CardContent sx={{ p: 3 }}>
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
          <Typography variant="h1">{value}</Typography>
          {delta !== null && (
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                gap: 0.5,
                typography: 'body2',
                py: 0.5,
                px: 1.5,
                borderRadius: 5,
                backgroundColor: isPositive
                  ? 'success.lighter'
                  : 'error.lighter',
                color: isPositive ? 'success.dark' : 'error.dark',
              }}
            >
              {isPositive ? <CaretUpOutlined /> : <CaretDownOutlined />}
              {`${isPositive ? '+' : ''}${delta}% vs. last month`}
            </Stack>
          )}
          <Typography sx={{ typography: 'body2', color: 'text.secondary' }}>
            {caption}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatTile;
