import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VolunteerNames from '../../../../data/volunteers';

const VolunteerSwitcher: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //TODO Implement the logic to get the user from the server
        const data = await VolunteerNames;
        setUsers(data);
        setSelectedUser(data[0] || '');
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };

    fetchData();
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (user: string) => {
    if (user !== selectedUser) {
      setSelectedUser(user);
      navigate(`/pick-your-name/`);
    }
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        aria-controls={Boolean(anchorEl) ? 'user-menu' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{
          textTransform: 'none',
          color: 'black',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '150px',
        }}
      >
        {selectedUser} ▼
      </Button>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'user-button',
        }}
      >
        {users.map((user) => (
          <MenuItem key={user} onClick={() => handleSelect(user)}>
            {user}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default VolunteerSwitcher;
