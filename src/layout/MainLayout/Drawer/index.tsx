import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery } from '@mui/material';

// project import
import DrawerContent from './DrawerContent';
import DrawerHeader from './DrawerHeader';
import MiniDrawerStyled from './MiniDrawerStyled';
import { drawerWidth } from '../../../config';
import DrawerFooter from './DrawerFooter';

// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

interface MainDrawerProps {
  open: boolean,
  handleDrawerToggle: () => void,
}

const MainDrawer: React.FC<MainDrawerProps> = ({ open, handleDrawerToggle }) => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'));

  // responsive drawer container
  // const container = un

  // header content
  const drawerContent = useMemo(() => <DrawerContent />, []);
  const drawerHeader = useMemo(() => <DrawerHeader open={open} />, [open]);
  const drawerFooter = useMemo(() => <DrawerFooter />, [open]);

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, zIndex: 1300 }} aria-label="mailbox folders">
      {!matchDownMD ? (
        <MiniDrawerStyled variant="permanent" open={open}>
          {drawerHeader}
          {drawerContent}
          {drawerFooter}
        </MiniDrawerStyled>
      ) : (
        <Drawer
          // container={container}
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundImage: 'none',
              boxShadow: 'inherit'
            }
          }}
        >
          {open && drawerHeader}
          {open && drawerContent}
          {open && drawerFooter}
        </Drawer>
      )}
    </Box>
  );
};


export default MainDrawer;
