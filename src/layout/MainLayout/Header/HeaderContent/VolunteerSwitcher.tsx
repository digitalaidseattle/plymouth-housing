import React, { useState, useContext } from 'react';
import { Menu, MenuItem, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  UserContext,
} from '../../../../components/contexts/UserContext';

const VolunteerSwitcher: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { loggedInUserId, setLoggedInUserId, activeVolunteers } = useContext(UserContext);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (selectedVolunteer: number) => {
    setLoggedInUserId(selectedVolunteer);
    navigate('/enter-your-pin');
    handleClose();
  };

  return (
    <Box>
      <Button
        aria-controls={anchorEl ? 'user-menu' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{
          textTransform: 'none',
          color: 'black',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          px: 2,
        }}
      >
        {activeVolunteers.find(volunteer => volunteer.id === loggedInUserId)?.name || 'Select Volunteer'} 
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
        {activeVolunteers
          .filter((v) => v.id !== loggedInUserId)
          .map((volunteer) => (
            <MenuItem
              key={volunteer.id}
              onClick={() => handleSelect(volunteer.id)}
            >
              {volunteer.name}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
};

export default VolunteerSwitcher;
