import React from 'react';
import SearchBar from '../../components/Searchbar/SearchBar';
import { Box, Button, Stack, Typography, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  roleFilter: string | null;
  onRoleFilterChange: (role: string | null) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  search = '',
  onSearchChange,
  statusFilter = null,
  onStatusFilterChange,
  roleFilter = null,
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
  const clearStatusFilter = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
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
  const clearRoleFilter = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onRoleFilterChange(null);
  };

  // Define roles as an array to make the component more scalable and reusable
  const roles = ['admin', 'volunteer'];

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="body2">Filters</Typography>

        <div>
          <Button
            variant="contained"
            aria-label="Status Filter"
            aria-haspopup="true"
            sx={{ color: 'common.black', bgcolor: 'grey.300', height: '30px', '&:hover': { bgcolor: 'grey.400' } }}
            onClick={handleStatusClick}
          >
            {statusFilter ? (
              <>
                {statusFilter}
                <Box
                  component="span"
                  role="button"
                  tabIndex={0}
                  aria-label="Clear Status Filter"
                  onClick={clearStatusFilter}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') clearStatusFilter(e); }}
                  sx={{ display: 'inline-flex', padding: 0, color: 'black', ml: 1, cursor: 'pointer' }}
                >
                  <ClearIcon sx={{ fontSize: 'large' }} />
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body2">Status</Typography>
                <ExpandMoreIcon sx={{ fontSize: 'large', ml: 1 }} />
              </>
            )}
          </Button>
          <Menu
            open={Boolean(statusAnchorEl)}
            onClose={handleStatusClose}
            anchorEl={statusAnchorEl}
          >
            <MenuItem onClick={() => onStatusFilterChange('Active')}>Active</MenuItem>
            <MenuItem onClick={() => onStatusFilterChange('Inactive')}>Inactive</MenuItem>
          </Menu>
        </div>

        <div>
          <Button
            variant="contained"
            aria-label="Role Filter"
            aria-haspopup="true"
            sx={{ color: 'common.black', bgcolor: 'grey.300', height: '30px', '&:hover': { bgcolor: 'grey.400' } }}
            onClick={handleRoleClick}
          >
            {roleFilter ? (
              <>
                {roleFilter}
                <Box
                  component="span"
                  role="button"
                  tabIndex={0}
                  aria-label="Clear Role Filter"
                  onClick={clearRoleFilter}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') clearRoleFilter(e); }}
                  sx={{ display: 'inline-flex', padding: 0, color: 'black', ml: 1, cursor: 'pointer' }}
                >
                  <ClearIcon sx={{ fontSize: 'large' }} />
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body2">Role</Typography>
                <ExpandMoreIcon sx={{ fontSize: 'large', ml: 1 }} />
              </>
            )}
          </Button>
          <Menu
            open={Boolean(roleAnchorEl)}
            onClose={handleRoleClose}
            anchorEl={roleAnchorEl}
          >
            {roles.map((role) => (
              <MenuItem key={role} onClick={() => onRoleFilterChange(role)}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </MenuItem>
            ))}
          </Menu>
        </div>

        <Box sx={{ flexGrow: 1 }}>
          <SearchBar
            searchValue={search}
            onSearchChange={onSearchChange}
            compact
            placeholder="Search..."
            width="100%"
          />
        </Box>
    </Stack>
  );
};

// Default props are provided via destructuring in the function parameters above.

export default UserFilters;
