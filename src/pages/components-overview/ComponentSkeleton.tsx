import { ReactNode, useEffect, useState } from 'react';

// material-ui
import { Grid, Skeleton, Stack } from '@mui/material';

// project import
import MainCard from '../../components/MainCard';

// ===============================|| COMPONENT - SKELETON ||=============================== //

const ComponentSkeleton = (props: { children: ReactNode }) => {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  const skeletonCard = (
    <MainCard
      title={<Skeleton sx={{ width: { xs: 120, md: 180 } }} />}
      secondary={
        <Skeleton animation="wave" variant="circular" width={24} height={24} />
      }
    >
      <Stack spacing={1}>
        <Skeleton />
        <Skeleton sx={{ height: 64 }} animation="wave" variant="rectangular" />
        <Skeleton />
        <Skeleton />
      </Stack>
    </MainCard>
  );

  return (
    <>
      {isLoading && (
        <Grid container spacing={3}>
          <Grid size = {{xs:12, md:6}}>
            {skeletonCard}
          </Grid>
          <Grid size = {{xs:12, md:6}}>
            {skeletonCard}
          </Grid>
          <Grid size = {{xs:12, md:6}}>
            {skeletonCard}
          </Grid>
          <Grid size = {{xs:12, md:6}}>
            {skeletonCard}
          </Grid>
        </Grid>
      )}
      {!isLoading && props.children}
    </>
  );
};

export default ComponentSkeleton;
