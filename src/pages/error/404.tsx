import { Button, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import Logo from '../../components/Logo/Logo';
import CenteredCard from '../../layout/MinimalLayout/CenteredCard';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import { VITE_APPLICATION_NAME } from '../../types/constants';

const Page404: React.FC = () => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate('/');
  };
  return (
    <MinimalWrapper>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Grid size={{ xs: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Logo />
            <Typography variant="h5">{VITE_APPLICATION_NAME}</Typography>
          </Stack>
        </Grid>
        <CenteredCard>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
              >
                <Typography variant="h3">Page Not Found</Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="baseline"
              >
                <Button
                  size="large"
                  onClick={handleReturn}
                  color={'primary'}
                  variant={'outlined'}
                >
                  Return to the home page
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CenteredCard>
      </Grid>
    </MinimalWrapper>
  );
};

export default Page404;
