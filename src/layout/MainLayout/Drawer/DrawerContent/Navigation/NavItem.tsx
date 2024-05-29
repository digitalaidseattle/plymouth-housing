import React, { forwardRef, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import { Avatar, Chip, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import { ActiveMenuItemContext, MenuItem } from '../../../../../components/contexts/ActiveMenuItemContext';
import { DrawerOpenContext } from '../../../../../components/contexts/DrawerOpenContext';

// ==============================|| NAVIGATION - LIST ITEM ||============================== //
interface NavItemProps {
  item: MenuItem,
  level: number
}

const NavItem: React.FC<NavItemProps> = ({ item, level }) => {
  const theme = useTheme();
  const { pathname } = useLocation();

  const { drawerOpen } = useContext(DrawerOpenContext)
  const { activeMenuItem, setActiveMenuItem } = useContext(ActiveMenuItemContext);

  // active menu item on page load
  useEffect(() => {
    if (pathname.includes(item.url)) {
      setActiveMenuItem(item.id);
    }
  }, [pathname, item, setActiveMenuItem]);

  let itemTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  // eslint-disable-next-line 
  const listItemProps = { component: forwardRef((props, ref: any) => <Link ref={ref} {...props} to={item.url} target={itemTarget} />) };
  // FIXME
  // if (item?.external) {
  //   listItemProps = { component: 'a', href: item.url, target: itemTarget };
  // }

  const itemHandler = (id: string) => {
    setActiveMenuItem(id);
  };

  const textColor = 'text.primary';
  const iconSelectedColor = 'primary.main';
  const Icon = item.icon as unknown as React.ForwardRefExoticComponent<any>;
  const itemIcon = item.icon && <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} />;
  const isSelected = activeMenuItem === item.id;

  return (
    <ListItemButton
      {...listItemProps}
      disabled={item.disabled}
      onClick={() => itemHandler(item.id)}
      selected={isSelected}
      sx={{
        zIndex: 1201,
        pl: drawerOpen ? `${level * 28}px` : 1.5,
        py: !drawerOpen && level === 1 ? 1.25 : 1,
        ...(drawerOpen && {
          '&:hover': {
            bgcolor: 'primary.lighter'
          },
          '&.Mui-selected': {
            bgcolor: 'primary.lighter',
            borderRight: `2px solid ${theme.palette.primary.main}`,
            color: iconSelectedColor,
            '&:hover': {
              color: iconSelectedColor,
              bgcolor: 'primary.lighter'
            }
          }
        }),
        ...(!drawerOpen && {
          '&:hover': {
            bgcolor: 'transparent'
          },
          '&.Mui-selected': {
            '&:hover': {
              bgcolor: 'transparent'
            },
            bgcolor: 'transparent'
          }
        })
      }}
    >
      {itemIcon && (
        <ListItemIcon
          sx={{
            minWidth: 28,
            color: isSelected ? iconSelectedColor : textColor,
            ...(!drawerOpen && {
              borderRadius: 1.5,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                bgcolor: 'secondary.lighter'
              }
            }),
            ...(!drawerOpen &&
              isSelected && {
              bgcolor: 'primary.lighter',
              '&:hover': {
                bgcolor: 'primary.lighter'
              }
            })
          }}
        >
          {itemIcon}
        </ListItemIcon>
      )}
      {(drawerOpen || (!drawerOpen && level !== 1)) && (
        <ListItemText
          primary={
            <Typography variant="h6" sx={{ color: isSelected ? iconSelectedColor : textColor }}>
              {item.title}
            </Typography>
          }
        />
      )}
      {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
        />
      )}
    </ListItemButton>
  );
};



export default NavItem;
