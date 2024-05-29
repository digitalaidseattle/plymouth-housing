/**
 *  DrawerHeader/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

// material-ui
import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import Logo from '../../../../components/Logo/Logo';

// ==============================|| DRAWER HEADER ||============================== //

const DrawerHeader = (props: { open: boolean }) => {
  const theme = useTheme();

  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent={props.open ? 'flex-start' : 'center'}
      paddingLeft={theme.spacing(props.open ? 3 : 0)} >
      <Stack direction="row" spacing={1} alignItems="center">
        <Logo />
        <Typography variant="h5">{import.meta.env.VITE_APPLICATION_NAME}</Typography>        
      </Stack>
    </Box>
  );
};

export default DrawerHeader;
