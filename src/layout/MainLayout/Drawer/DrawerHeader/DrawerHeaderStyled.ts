// material-ui
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// ==============================|| DRAWER HEADER - STYLED ||============================== //

type DrawerHeaderStyledProps = {
  open: boolean
}
const DrawerHeaderStyled = styled(Box, { shouldForwardProp: (prop) => prop !== 'open' })<DrawerHeaderStyledProps>(
  ({ theme, open }) => ({
    ...theme.mixins.toolbar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: open ? 'flex-start' : 'center',
    paddingLeft: theme.spacing(open ? 3 : 0)
  })
);

export default DrawerHeaderStyled;
