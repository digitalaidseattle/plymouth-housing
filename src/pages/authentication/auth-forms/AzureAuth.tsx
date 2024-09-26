// material-ui
import { Button, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// assets
import Microsoft from '../../../assets/images/icons/microsoft.svg';

//azure oauth
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../../authConfig'; // see authConfig.ts code bellow
import { useNavigate } from 'react-router-dom';
// ==============================|| FIREBASE - SOCIAL BUTTON ||============================== //

const AzureAuth = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const { instance } = useMsal();
  const navigate = useNavigate();

  const azureLoginHandler = () => {
    instance
      .loginPopup(loginRequest)
      .then((response) => {
        instance.setActiveAccount(response.account);
        const idTokenClaims = response.idTokenClaims as { roles?: string[] };
        const roles = idTokenClaims.roles || [];

        if (roles.includes('admin')) {
          navigate('/inventory');
        } else if (roles.includes('volunteer')) {
          navigate('/pick-your-name');
        } else {
          navigate('/');
        }
      })
      .catch((error) => {
        console.error('Login failed:', error);
      });
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
        onClick={azureLoginHandler}
      >
        {!matchDownSM && 'Microsoft'}
      </Button>
    </Stack>
  );
};

export default FirebaseSocial;
