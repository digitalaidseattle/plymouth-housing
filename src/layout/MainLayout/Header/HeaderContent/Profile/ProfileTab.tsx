import React from 'react';

// material-ui
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// assets
import {
  LogoutOutlined,
} from '@ant-design/icons';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //
type ProfileTabProps = {
  handleLogout: () => void;
};

const ProfileTab: React.FC<ProfileTabProps> = ({ handleLogout }) => {
  const theme = useTheme();

  return (
    <List
      component="nav"
      sx={{
        p: 0,
        '& .MuiListItemIcon-root': {
          minWidth: 32,
          color: theme.palette.grey[500],
        },
      }}
    >
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
};

export default ProfileTab;
