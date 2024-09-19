import React from 'react';
import { Grid, Stack } from '@mui/material';

interface CenteredLayoutProps {
  children: React.ReactNode;
}

const CenteredLayout: React.FC<CenteredLayoutProps> = ({ children }) => {
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="flex-start" 
      sx={{ minHeight: '90vh', paddingTop: '25vh' }} 
    >
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Stack
          direction="column"
          spacing={3}
          alignItems="center"
          justifyContent="center"
        >
          {children}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default CenteredLayout;
