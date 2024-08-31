import { useNavigate } from 'react-router-dom';
// material-ui
import { Grid, Stack, Typography } from '@mui/material';
import { Button} from '@mui/material';
// project import
import Logo from '../../components/Logo/Logo';
import CenteredCard from '../../layout/MinimalLayout/CenteredCard';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import PinInput from './PinInput';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const handleNextClick = () => {
      navigate('/');
  };
  const handlePrevClick = () => {
    navigate('/pick-your-name');
};

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
            <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
              <Typography variant="h3" textAlign="center">Please login</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
              <PinInput />
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Button variant="contained" color="primary" onClick={handlePrevClick}>
                  Previous
                </Button>
                <Button variant="contained" color="primary" onClick={handleNextClick}>
                  Next
                </Button>
              </Stack>
            </Grid>
        </Grid>
      </CenteredCard>
    </Grid>
  </MinimalWrapper>)
};

export default Login;
