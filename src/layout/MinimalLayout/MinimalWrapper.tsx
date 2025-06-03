/**
 *  AuthWrapper.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode } from 'react';

// material-ui
import { Box, Grid } from '@mui/material';

// project import

// assets
import MinimalFooter from './MinimalFooter';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const MinimalWrapper = (props: { children: ReactNode }) => (
  <Box sx={{ minHeight: '100vh' }}>
    <Grid
      container
      direction="column"
      justifyContent="flex-end"
      sx={{
        minHeight: '100vh',
      }}
    >
      <Grid size={{ xs: 12 }}> 
        <Grid
          size={{ xs: 12 }}
          container
          justifyContent="center"
          alignItems="center"
          sx={{
            minHeight: { xs: 'calc(100vh - 134px)', md: 'calc(100vh - 112px)' },
          }}
        >
          <Grid>{props.children}</Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }} sx={{ m: 3, mt: 1 }}>
        <MinimalFooter />
      </Grid>
    </Grid>
  </Box>
);

export default MinimalWrapper;
