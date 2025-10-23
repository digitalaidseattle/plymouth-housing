/**
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Logo from '../../../../components/Logo/Logo';
import { VITE_APPLICATION_NAME } from '../../../../types/constants';

const DrawerHeader = (props: { open: boolean }) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent={props.open ? 'flex-start' : 'center'}
      paddingLeft={theme.spacing(props.open ? 3 : 0)}
      paddingTop={theme.spacing(1)}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Logo />
        <Typography variant="h5">{VITE_APPLICATION_NAME}</Typography>
      </Stack>
    </Box>
  );
};

export default DrawerHeader;
