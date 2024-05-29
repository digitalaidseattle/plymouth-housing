// material-ui
import { Box, Typography } from '@mui/material';

// project import
import NavGroup from './NavGroup';
import menuItem from '../../../../../menu-items';
import { ActiveMenuItemContext } from '../../../../../components/contexts/ActiveMenuItemContext';
import { useState } from 'react';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null)

  // FIXME
  // eslint-disable-next-line 
  const navGroups = menuItem.items.map((item: any) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return (
    <Box sx={{ pt: 2 }}>
      <ActiveMenuItemContext.Provider value={{ activeMenuItem, setActiveMenuItem }}>
        {navGroups}
      </ActiveMenuItemContext.Provider>
    </Box>
  );
};

export default Navigation;
