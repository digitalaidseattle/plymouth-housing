import React from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import { CategoryItem } from '../../types/interfaces.ts';
import SearchBar from '../SearchBar';

interface InventoryFilterProps {
  filters: {
    type: string;
    category: string;
    status: string;
    search: string;
  };
  anchors: {
    type: null | HTMLElement;
    category: null | HTMLElement;
    status: null | HTMLElement;
  };
  categoryData: CategoryItem[];
  handleFilterClick: (filter: 'type' | 'category' | 'status', event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMenuClick: (filter: 'type' | 'category' | 'status', value: string) => void;
  clearFilter: (filter: 'type' | 'category' | 'status') => void;
  handleSearch: (value: string) => void;
}

const InventoryFilter: React.FC<InventoryFilterProps> = ({ 
  filters, 
  anchors, 
  categoryData, 
  handleFilterClick, 
  handleMenuClick, 
  clearFilter, 
  handleSearch 
}) => {
  return (
    <Box id="filter-container" sx={{ display: 'flex', alignItems: 'center', maxWidth: '90%' }}>
      <Typography variant="body2">Filters</Typography>

      {/* Type Filter */}
      <Box sx={{ px: '8px' }} id="type-button-container">
        <Button
          sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
          onClick={(event) => handleFilterClick('type', event)}
        >
          {filters.type ? (
            <>
              {filters.type}{' '}
              <ClearIcon
                sx={{ fontSize: 'large', ml: '6px' }}
                onClick={() => clearFilter('type')}
              />
            </>
          ) : (
            <>
              <Typography variant="body2">Type</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu
          open={Boolean(anchors.type)}
          onClose={() => handleMenuClick('type', '')}
          anchorEl={anchors.type}
        >
          <MenuItem onClick={() => handleMenuClick('type', 'General')}>
            General
          </MenuItem>
          <MenuItem onClick={() => handleMenuClick('type', 'Welcome Basket')}>
            Welcome Basket
          </MenuItem>
        </Menu>
      </Box>

      {/* Category Filter */}
      <Box sx={{ px: '8px' }} id="category-button-container">
        <Button
          sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
          onClick={(event) => handleFilterClick('category', event)}
        >
          {' '}
          {filters.category ? (
            <>
              {filters.category}{' '}
              <ClearIcon
                sx={{ fontSize: 'large', ml: '6px' }}
                onClick={() => clearFilter('category')}
              />
            </>
          ) : (
            <>
              <Typography variant="body2">Category</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu
          open={Boolean(anchors.category)}
          onClose={() => handleMenuClick('category', '')}
          anchorEl={anchors.category}
        >
          {categoryData.map((categoryItem) => (
            <MenuItem
              key={categoryItem.name}
              onClick={() => handleMenuClick('category', categoryItem.name)}
            >
              {categoryItem.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Status Filter */}
      <Box sx={{ px: '8px' }} id="status-button-container">
        <Button
          sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
          onClick={(event) => handleFilterClick('status', event)}
        >
          {filters.status ? (
            <>
              {filters.status}{' '}
              <ClearIcon
                sx={{ fontSize: 'large', ml: '6px' }}
                onClick={() => clearFilter('status')}
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
          open={Boolean(anchors.status)}
          onClose={() => handleMenuClick('status', '')}
          anchorEl={anchors.status}
        >
          <MenuItem onClick={() => handleMenuClick('status', 'Out of Stock')}>
            Out of Stock
          </MenuItem>
          <MenuItem onClick={() => handleMenuClick('status', 'Low Stock')}>
            Low Stock
          </MenuItem>
          <MenuItem onClick={() => handleMenuClick('status', 'Normal Stock')}>
            Normal Stock
          </MenuItem>
        </Menu>
      </Box>

      {/* Search Filter */}
      <Box id="search-container" sx={{ ml: 'auto' }}>
        <SearchBar
          searchValue={filters.search}
          onSearchChange={handleSearch}
          placeholder="Search..."
          width="100%"
        />
      </Box>
    </Box>
  );
};

export default InventoryFilter;