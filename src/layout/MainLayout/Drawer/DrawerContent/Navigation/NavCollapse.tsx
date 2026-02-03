import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  ActiveMenuItemContext,
  MenuItem,
} from '../../../../../components/contexts/ActiveMenuItemContext';
import { DrawerOpenContext } from '../../../../../components/contexts/DrawerOpenContext';
import NavItem from './NavItem';

interface NavCollapseProps {
  item: MenuItem;
  level: number;
}

const NavCollapse: React.FC<NavCollapseProps> = ({ item, level }) => {
  const theme = useTheme();
  const { drawerOpen } = useContext(DrawerOpenContext);
  const { activeMenuItem, setActiveMenuItem } = useContext(
    ActiveMenuItemContext,
  );
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const checkOpenForParent = (children: MenuItem[], currentPath: string) => {
    return children.some((child) => {
      if (child.url && currentPath.includes(child.url)) {
        return true;
      }
      if (child.children) {
        return checkOpenForParent(child.children, currentPath);
      }
      return false;
    });
  };

  useEffect(() => {
    if (item.children) {
      const shouldOpen = checkOpenForParent(item.children, location.pathname);
      setOpen(shouldOpen);
    }
  }, [location.pathname, item.children]);

  const handleClick = () => {
    setOpen(!open);
    if (item.url) {
      navigate(item.url);
      setActiveMenuItem(item.id);
    }
  };

  const Icon = item.icon as unknown as React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const itemIcon = item.icon && (
    <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} />
  );

  const isAnyChildSelected = item.children?.some(
    (child) => activeMenuItem === child.id,
  );
  const textColor = 'text.primary';
  const iconSelectedColor = 'primary.main';

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{
          zIndex: 1201,
          pl: drawerOpen ? `${level * 28}px` : 1.5,
          py: !drawerOpen && level === 1 ? 1.25 : 1,
          ...(drawerOpen && {
            '&:hover': {
              bgcolor: 'primary.lighter',
            },
            ...(isAnyChildSelected && {
              bgcolor: 'primary.lighter',
              borderRight: `2px solid ${theme.palette.primary.main}`,
              color: iconSelectedColor,
            }),
          }),
          ...(!drawerOpen && {
            '&:hover': {
              bgcolor: 'transparent',
            },
          }),
        }}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: isAnyChildSelected ? iconSelectedColor : textColor,
              ...(!drawerOpen && {
                borderRadius: 1.5,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: 'secondary.lighter',
                },
              }),
              ...(!drawerOpen &&
                isAnyChildSelected && {
                  bgcolor: 'primary.lighter',
                  '&:hover': {
                    bgcolor: 'primary.lighter',
                  },
                }),
            }}
          >
            {itemIcon}
          </ListItemIcon>
        )}
        {(drawerOpen || (!drawerOpen && level !== 1)) && (
          <ListItemText
            primary={
              <Typography
                variant="h6"
                sx={{ color: isAnyChildSelected ? iconSelectedColor : textColor }}
              >
                {item.title}
              </Typography>
            }
          />
        )}
        {drawerOpen && (open ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>
      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child) => (
              <NavItem key={child.id} item={child} level={level + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default NavCollapse;
