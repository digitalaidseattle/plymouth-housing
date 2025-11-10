import { useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  AppBar,
  Box,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  Toolbar,
} from '@mui/material';

// project import
import Profile from './Profile';
import Transitions from '../../../../components/@extended/Transitions';

// assets
import { MoreOutlined } from '@ant-design/icons';

// ==============================|| HEADER CONTENT - MOBILE ||============================== //

const MobileSection = () => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorEl && anchorEl.contains(event.target as Node)) {
      return;
    }
    setAnchorEl(null);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorEl?.focus();
    }
    prevOpen.current = open;
  }, [open, anchorEl]);

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          component="span"
          disableRipple
          sx={{
            bgcolor: open ? 'grey.300' : 'grey.100',
          }}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          color="inherit"
        >
          <MoreOutlined />
        </IconButton>
      </Box>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorEl}
        role={undefined}
        transition
        disablePortal
        style={{
          width: '100%',
        }}
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.shadows['1'] }}>
              <ClickAwayListener onClickAway={handleClose}>
                <AppBar color="inherit">
                  <Toolbar>
                    <Profile />
                  </Toolbar>
                </AppBar>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default MobileSection;
