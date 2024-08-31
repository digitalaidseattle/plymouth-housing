// material-ui
import { Button, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
// assets
// import Google from '../../../assets/images/icons/google.svg';
import Microsoft from '../../../assets/images/icons/microsoft.svg';
import { authService } from '../../../services/authService';
import { loggingService } from '../../../services/loggingService';
import { supabaseClient } from '../../../services/supabaseClient'; 

// ==============================|| FIREBASE - SOCIAL BUTTON ||============================== //

const FirebaseSocial = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  // const googleHandler = async () => {
  //   authService.signInWithGoogle()
  //     .then((resp) => loggingService.info('Logged in with Google: ' + resp.data.url))
  // };

  const microsoftHandler = async () => {
    // authService.signInWithAzure()
    //   .then((resp) => loggingService.info('Logged in with Azure: ' + resp.data.url))
    try {
      const { data, error } = await authService.signInWithAzure();
      if (error) throw error;

      loggingService.info('Logged in with Azure: ' + data.url);

      await supabaseClient.auth.onAuthStateChange(
        async (event, session) => {
          console.log("auth state changed: ", session);        
        }
      );
  
      // Fetch session details

      const { data: sessiondata, error: sessionError } = await supabaseClient.auth.refreshSession();
      if (sessionError)  loggingService.error('Login failed: ' + sessionError.message);;
  
      console.log('sessiondata', sessiondata);
  
      if (!sessiondata || !sessiondata.session) {
        throw new Error('No session data found');
      }
  
      // Fetch user details
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userError) throw userError;
  
      console.log('userData', userData);
  
      if (!userData || !userData.user) {
        throw new Error('No user data found');
      }
  
      const user: User = userData.user;
  
      // Assuming user role is stored in user.user_metadata.role
      const role = user.user_metadata.role;
      console.log('User role:', role);
  
      navigate('/enter-pin');
    } catch (error) {
      loggingService.error('Login failed: ' + (error as Error).message);
      console.error('Error details:', error);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={matchDownSM ? 1 : 2}
      justifyContent={matchDownSM ? 'space-around' : 'space-between'}
      sx={{ '& .MuiButton-startIcon': { mr: matchDownSM ? 0 : 1, ml: matchDownSM ? 0 : -0.5 } }}
    >
      {/* <Button
        title='Login with Google'
        variant="outlined"
        color="secondary"
        fullWidth={!matchDownSM}
        startIcon={<img src={Google} alt="Google" />}
        onClick={googleHandler}>
        {!matchDownSM && 'Google'}
      </Button> */}

      <Button
        title='Login with Microsoft'
        variant="outlined"
        color="secondary"
        fullWidth={!matchDownSM}
        startIcon={<img src={Microsoft} alt="Microsoft" />}
        onClick={microsoftHandler}>
        {!matchDownSM && 'Microsoft'}
      </Button>

      {/* <Button
        title='Login with Facebook'
        variant="outlined"
        color="secondary"
        fullWidth={!matchDownSM}
        startIcon={<img src={Facebook} alt="Facebook" />}
        onClick={facebookHandler}>
        {!matchDownSM && 'Facebook'}
      </Button> */}
    </Stack>
  );
};

export default FirebaseSocial;
