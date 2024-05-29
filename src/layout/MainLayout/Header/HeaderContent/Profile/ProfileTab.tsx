import React, { useState } from 'react';

// material-ui
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// assets
import { EditOutlined, LogoutOutlined, ProfileOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //
type ProfileTabProps = {
  handleLogout: () => void
};


const ProfileTab: React.FC<ProfileTabProps> = ({ handleLogout }) => {
  const theme = useTheme();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleListItemClick = (_event: React.SyntheticEvent, index: number) => {
    setSelectedIndex(index);
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: theme.palette.grey[500] } }}>
      <ListItemButton selected={selectedIndex === 0} onClick={(event) => handleListItemClick(event, 0)}>
        <ListItemIcon>
          <EditOutlined />
        </ListItemIcon>
        <ListItemText primary="Edit Profile" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 1} onClick={(event) => handleListItemClick(event, 1)}>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="View Profile" />
      </ListItemButton>

      <ListItemButton selected={selectedIndex === 3} onClick={(event) => handleListItemClick(event, 3)}>
        <ListItemIcon>
          <ProfileOutlined />
        </ListItemIcon>
        <ListItemText primary="Social Profile" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 4} onClick={(event) => handleListItemClick(event, 4)}>
        <ListItemIcon>
          <WalletOutlined />
        </ListItemIcon>
        <ListItemText primary="Billing" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
};


export default ProfileTab;
