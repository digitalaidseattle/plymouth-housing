import React from 'react';
import { Box, Button, Typography, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import SearchBar from '../../components/SearchBar/SearchBar';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  roleFilter: string | null;
  onRoleFilterChange: (role: string | null) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
}) => {
  const [statusAnchorEl, setStatusAnchorEl] = React.useState<null | HTMLElement>(null);
  const [roleAnchorEl, setRoleAnchorEl] = React.useState<null | HTMLElement>(null);

  // Handle the opening of the status filter menu
  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  // Handle the closing of the status filter menu
  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  // Clear the status filter value and prevent menu closure on ClearIcon click
  const clearStatusFilter = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the menu from closing when clicking on ClearIcon
    onStatusFilterChange(null);
  };

  // Handle the opening of the role filter menu
  const handleRoleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setRoleAnchorEl(event.currentTarget);
  };

  // Handle the closing of the role filter menu
  const handleRoleClose = () => {
    setRoleAnchorEl(null);
  };

  // Clear the role filter value and prevent menu closure on ClearIcon click
  const clearRoleFilter = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the menu from closing when clicking on ClearIcon
    onRoleFilterChange(null);
  };

  // Define roles as an array to make the component more scalable and reusable
  const roles = ['admin', 'volunteer'];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '90%' }}>
      <Typography variant="body2">Filters</Typography>
      <Box sx={{ px: '8px' }}>
        <Button
          aria-label="Status Filter" 
          aria-haspopup="true" 
          sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
          onClick={handleStatusClick}
        >
          {statusFilter ? (
            <>
              {statusFilter}
              <Button
                aria-label="Clear Status Filter"
                onClick={clearStatusFilter}
                sx={{ minWidth: 0, padding: 0, color: 'black' }}
              >
                <ClearIcon sx={{ fontSize: 'large', ml: '6px',  }} />
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2">Status</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu
          open={Boolean(statusAnchorEl)}
          onClose={handleStatusClose}
          anchorEl={statusAnchorEl}
        >
          <MenuItem onClick={() => onStatusFilterChange('Active')}>
            Active
          </MenuItem>
          <MenuItem onClick={() => onStatusFilterChange('Inactive')}>
            Inactive
          </MenuItem>
        </Menu>
      </Box>
      <Box sx={{ px: '8px' }}>
        <Button
          aria-label="Role Filter"
          aria-haspopup="true"
          sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
          onClick={handleRoleClick}
        >
          {roleFilter ? (
            <>
              {roleFilter}
              <Button
                aria-label="Clear Role Filter"
                onClick={clearRoleFilter}
                sx={{ minWidth: 0, padding: 0 ,color: 'black' }}
              >
                <ClearIcon sx={{ fontSize: 'large', ml: '6px' }} />
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2">Role</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu
          open={Boolean(roleAnchorEl)}
          onClose={handleRoleClose}
          anchorEl={roleAnchorEl}
        >
          {roles.map((role) => (
            <MenuItem
              key={role}
              onClick={() => onRoleFilterChange(role)} // Dynamically handles role changes using an array
            >
              {role.charAt(0).toUpperCase() + role.slice(1)} {/* Capitalize the first letter of each role */}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Box sx={{ ml: 'auto' }}>
        <SearchBar
          searchValue={search}
          onSearchChange={onSearchChange}
          placeholder="Search..."
          width="100%"
        />
      </Box>
    </Box>
  );
};

// Provide default values for props to avoid runtime errors if no props are passed
UserFilters.defaultProps = {
  search: '',
  statusFilter: null,
  roleFilter: null,
};

export default UserFilters;