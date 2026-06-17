/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useContext, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  ClickAwayListener,
  Divider,
  Paper,
  Popper,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Transitions from '../../../../../components/@extended/Transitions';
import MainCard from '../../../../../components/MainCard';
import { LogoutOutlined } from '@ant-design/icons';
import { UserContext } from '../../../../../components/contexts/UserContext';

const Profile = () => {
  const theme = useTheme();
  const { user } = useContext(UserContext);

  const username = user?.userDetails ?? 'Null';
  const role = user?.userRoles?.includes('admin')
    ? 'Admin'
    : user?.userRoles?.includes('volunteer')
    ? 'Volunteer'
    : '';

  const handleLogout = async () => {
    localStorage.clear();
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/login.html';
  };

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

  return (
    <Box sx={{ flexShrink: 0, ml: 1 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? theme.palette.grey[300] : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: theme.palette.grey[100] },
        }}
        aria-label="open profile"
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 0.5 }}>
          <Avatar alt="profile user" sx={{ width: 32, height: 32 }} />
          <Typography variant="subtitle1">{username}</Typography>
        </Stack>
      </ButtonBase>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorEl}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            {open && (
              <Paper sx={{ boxShadow: theme.shadows[2], width: 260 }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard elevation={0} border={false} content={false}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar alt="profile user" sx={{ width: 44, height: 44 }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ wordBreak: 'break-word', lineHeight: 1.3 }}
                        >
                          {username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />

                    <Box sx={{ p: 1 }}>
                      <Button
                        fullWidth
                        startIcon={<LogoutOutlined />}
                        onClick={handleLogout}
                        color="secondary"
                        variant="text"
                        sx={{
                          textTransform: 'none',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'none' },
                          '& .MuiButton-startIcon': { color: theme.palette.grey[500] },
                        }}
                      >
                        Log out
                      </Button>
                    </Box>
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            )}
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Profile;
