import { Box, List, Typography } from '@mui/material';
import { useContext } from 'react';
import { DrawerOpenContext } from '../../../../../components/contexts/DrawerOpenContext';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import { MenuItem } from '../../../../../components/contexts/ActiveMenuItemContext';
import { UserContext } from '../../../../../components/contexts/UserContext';
import { getRole } from '../../../../../utils/userUtils';
import { ROLE_PAGES } from '../../../../../types/constants';

interface NavGroupProps {
  item: MenuItem;
}
const NavGroup: React.FC<NavGroupProps> = ({ item }) => {
  const { drawerOpen } = useContext(DrawerOpenContext);
  const { user } = useContext(UserContext);
  const userRole = user ? getRole(user) : null;
  const permittedPages: readonly string[] = userRole
    ? ROLE_PAGES[userRole as keyof typeof ROLE_PAGES]
    : [];

  const navCollapse = item.children?.map((menuItem: MenuItem) => {
    switch (menuItem.type) {
      case 'collapse':
        return (
          permittedPages.includes(menuItem.id) && (
            <NavCollapse key={menuItem.id} item={menuItem} level={1} />
          )
        );
      case 'item':
        // Show menu item if its ID is in the permitted pages for this user's role
        return (
          permittedPages.includes(menuItem.id) && (
            <NavItem key={menuItem.id} item={menuItem} level={1} />
          )
        );
      case 'admin':
        return (
          userRole === 'admin' && (
            <NavItem key={menuItem.id} item={menuItem} level={1} />
          )
        );
      default:
        return (
          <Typography
            key={menuItem.id}
            variant="h6"
            color="error"
            align="center"
          >
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
