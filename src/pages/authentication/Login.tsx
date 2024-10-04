// material-ui
import { Grid, Stack, Typography } from '@mui/material';

// project import
import Logo from '../../components/Logo/Logo';
import CenteredCard from '../../layout/MinimalLayout/CenteredCard';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import AzureAuth  from './auth-forms/AzureAuth';
import CenteredLayout from './CenteredLayout';

// ================================|| 404 ||================================ //

const Login: React.FC = () => {
  console.log(import.meta.env.VITE_AUTH_CLIENT_ID);
  console.log(import.meta.env.VITE_AUTH_AUTHORITY);
  console.log(import.meta.env.VITE_AUTH_REDIRECT_URI);
  console.log(import.meta.env.VITE_SUPABASE_URL);

  return (
    <MinimalWrapper>
      <CenteredLayout>
        <Stack direction="row" spacing={1} alignItems="center">
          <Logo />
          <Typography variant="h5">
            {import.meta.env.VITE_APPLICATION_NAME}
          </Typography>
        </Stack>
        <CenteredCard>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                sx={{ mb: { xs: -0.5, sm: 0.5 } }}
              >
                <Typography variant="h3" textAlign="center">
                  Please login
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <AzureAuth />
            </Grid>
          </Grid>
        </CenteredCard>
      </CenteredLayout>
    </MinimalWrapper>
  );
};

export default Login;
