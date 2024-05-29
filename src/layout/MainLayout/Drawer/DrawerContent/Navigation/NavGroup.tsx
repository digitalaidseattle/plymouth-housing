
// material-ui
import { Box, List, Typography } from '@mui/material';

// project import
import { useContext } from 'react';
import { DrawerOpenContext } from '../../../../../components/contexts/DrawerOpenContext';
import NavItem from './NavItem';
import { MenuItem } from '../../../../../components/contexts/ActiveMenuItemContext';

// ==============================|| NAVIGATION - LIST GROUP ||============================== //

interface NavGroupProps {
  item: MenuItem
}
const NavGroup: React.FC<NavGroupProps> = ({ item }) => {
  const { drawerOpen } = useContext(DrawerOpenContext);

  const navCollapse = item.children?.map((menuItem: MenuItem) => {
    switch (menuItem.type) {
      case 'collapse':
        return (
          <Typography key={menuItem.id} variant="caption" color="error" sx={{ p: 2.5 }}>
            collapse - only available in paid version
          </Typography>
        );
      case 'item':
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  return (
    <List
      subheader={
        item.title &&
        drawerOpen && (
          <Box sx={{ pl: 3, mb: 1.5 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {item.title}
            </Typography>
            {/* only available in paid version */}
          </Box>
        )
      }
      sx={{ mb: drawerOpen ? 1.5 : 0, py: 0, zIndex: 0 }}
    >
      {navCollapse}
    </List>
  );
};

export default NavGroup;
