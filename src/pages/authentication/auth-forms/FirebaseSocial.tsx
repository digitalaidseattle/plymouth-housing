// material-ui
import { Button, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// assets
import Microsoft from '../../../assets/images/icons/microsoft.svg';
import { authService } from '../../../services/authService';
import { loggingService } from '../../../services/loggingService';

// ==============================|| FIREBASE - SOCIAL BUTTON ||============================== //

const FirebaseSocial = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const microsoftHandler = async () => {
    authService
      .signInWithAzure()
      .then((resp) =>
        loggingService.info('Logged in with Azure: ' + resp.data.url),
      );
  };

  return (
    <Stack
      direction="row"
      spacing={matchDownSM ? 1 : 2}
      justifyContent={matchDownSM ? 'space-around' : 'space-between'}
      sx={{
        '& .MuiButton-startIcon': {
          mr: matchDownSM ? 0 : 1,
          ml: matchDownSM ? 0 : -0.5,
        },
      }}
    >
      <Button
        title="Login with Microsoft"
        variant="outlined"
        color="secondary"
        fullWidth={!matchDownSM}
        startIcon={<img src={Microsoft} alt="Microsoft" />}
        onClick={microsoftHandler}
      >
        {!matchDownSM && 'Microsoft'}
      </Button>
    </Stack>
  );
};

export default FirebaseSocial;
