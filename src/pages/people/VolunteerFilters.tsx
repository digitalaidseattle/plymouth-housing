import React from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';

interface VolunteerFiltersProps {
  search: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
}

const VolunteerFilters: React.FC<VolunteerFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [anchorStatus, setAnchorStatus] = React.useState<null | HTMLElement>(
    null,
  );

  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorStatus(event.currentTarget);
  };

  const handleStatusClose = () => {
    setAnchorStatus(null);
  };

  const clearStatusFilter = () => {
    onStatusFilterChange(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '90%' }}>
      <Typography variant="body2">Filters</Typography>
      <Box sx={{ px: '8px' }}>
        <Button
          sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
          onClick={handleStatusClick}
        >
          {statusFilter ? (
            <>
              {statusFilter}
              <ClearIcon
                sx={{ fontSize: 'large', ml: '6px' }}
                onClick={clearStatusFilter}
              />
            </>
          ) : (
            <>
              <Typography variant="body2">Status</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu
          open={Boolean(anchorStatus)}
          onClose={handleStatusClose}
          anchorEl={anchorStatus}
        >
          <MenuItem onClick={() => onStatusFilterChange('Active')}>
            Active
          </MenuItem>
          <MenuItem onClick={() => onStatusFilterChange('Inactive')}>
            Inactive
          </MenuItem>
        </Menu>
      </Box>
      <Box sx={{ ml: 'auto' }}>
        <TextField
          value={search}
          onChange={onSearchChange}
          variant="standard"
          placeholder="Search"
        />
      </Box>
    </Box>
  );
};

export default VolunteerFilters;
