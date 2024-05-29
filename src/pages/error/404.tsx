
// material-ui
import { Button, Grid, Stack, Typography } from '@mui/material';

// project import
import { useNavigate } from 'react-router';
import Logo from '../../components/Logo/Logo';
import CenteredCard from '../../layout/MinimalLayout/CenteredCard';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';

// ================================|| 404 ||================================ //

const Page404: React.FC = () => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate('/');
  }
  return (<MinimalWrapper>
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center">
      <Grid item xs={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Logo />
          <Typography variant="h5">{import.meta.env.VITE_APPLICATION_NAME}</Typography>
        </Stack>
      </Grid>
      <CenteredCard>
        <Grid container spacing={3} >
          <Grid item xs={12} >
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" >
              <Typography variant="h3">Page Not Found</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" justifyContent="center" alignItems="baseline">
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
  </MinimalWrapper>)
};

export default Page404;
