import React from 'react';
import { Grid, Stack } from '@mui/material';

interface CenteredLayoutProps {
  children: React.ReactNode;
}

const CenteredLayout: React.FC<CenteredLayoutProps> = ({ children }) => {
  return (
    <Grid
      container
      sx={{
        minHeight: '90vh',
        paddingTop: '25vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Grid size={{ xs: 12, sm: 11, md: 10, lg: 9 }}>
        <Stack
          direction="column"
          spacing={3}
          sx={{ alignItems: 'center', justifyContent: 'center' }}
        >
          {children}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default CenteredLayout;
