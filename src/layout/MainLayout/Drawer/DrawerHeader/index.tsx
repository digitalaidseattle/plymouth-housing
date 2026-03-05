/**
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Logo from '../../../../components/Logo/Logo';
import plymouthHousingLogo from '../../../../assets/images/plymouth_housing_logo.png';

const DrawerHeader = (props: { open: boolean }) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent={props.open ? 'stretch' : 'center'}
      paddingLeft={theme.spacing(0)}
      paddingTop={theme.spacing(props.open ? 1.5 : 1)}
      sx={props.open ? { bgcolor: '#e8a817', mr: '-1px', pb: '10px' } : undefined}
    >
      {props.open ? (
        <Box
          component="img"
          src={plymouthHousingLogo}
          alt="Plymouth Housing"
          sx={{
            display: 'block',
            width: '100%',
            height: 80,
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      ) : (
        <Logo />
      )}
    </Box>
  );
};

export default DrawerHeader;
