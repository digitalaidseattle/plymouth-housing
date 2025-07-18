// material-ui
import { Box, Chip, Grid, Stack, Typography } from '@mui/material';

// project import
import MainCard from '../../MainCard';

// assets
import { FallOutlined, RiseOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

// ==============================|| STATISTICS - ECOMMERCE CARD  ||============================== //
type AnalyticEcommerceProps = {
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
  title: string;
  count: string;
  percentage: number;
  isLoss?: boolean;
  extra: ReactNode | string;
};

const AnalyticEcommerce: React.FC<AnalyticEcommerceProps> = ({
  color = 'primary',
  title,
  count,
  percentage,
  isLoss,
  extra,
}) => (
  <MainCard contentSX={{ p: 2.25 }}>
    <Stack spacing={0.5}>
      <Typography variant="h6" color="textSecondary">
        {title}
      </Typography>
      <Grid container alignItems="center">
        <Grid>
          <Typography variant="h4" color="inherit">
            {count}
          </Typography>
        </Grid>
        {percentage && (
          <Grid>
            <Chip
              variant="outlined"
              color={color}
              icon={
                <>
                  {!isLoss && (
                    <RiseOutlined
                      style={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  )}
                  {isLoss && (
                    <FallOutlined
                      style={{ fontSize: '0.75rem', color: 'inherit' }}
                    />
                  )}
                </>
              }
              label={`${percentage}%`}
              sx={{ ml: 1.25, pl: 1 }}
              size="small"
            />
          </Grid>
        )}
      </Grid>
    </Stack>
    <Box sx={{ pt: 2.25 }}>
      <Typography variant="caption" color="textSecondary">
        You made an extra{' '}
        <Typography
          component="span"
          variant="caption"
          sx={{ color: `${color || 'primary'}.main` }}
        >
          {extra}
        </Typography>{' '}
        this year
      </Typography>
    </Box>
  </MainCard>
);

export default AnalyticEcommerce;
