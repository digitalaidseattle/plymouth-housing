import React from 'react';
import SearchBar from '../Searchbar/SearchBar.tsx';
import { Box, Button, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import { CategoryItem } from '../../types/interfaces.ts';

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

const statusOptions = ['Needs Review', 'Out of Stock', 'Low Stock', 'Normal Stock'];

const InventoryFilter: React.FC<InventoryFilterProps> = ({
  filters,
  anchors,
  categoryData,
  handleFilterClick,
  handleMenuClick,
  clearFilter,
  handleSearch,
}) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="body2">Filters</Typography>

        {/* Type Filter */}
        <div id="type-button-container">
        <Button
          variant="contained"
          sx={{ color: 'common.black', bgcolor: 'grey.300', height: '30px', '&:hover': { bgcolor: 'grey.400' } }}
          onClick={(event) => handleFilterClick('type', event)}
        >
          {filters.type ? (
            <>
              {filters.type}{' '}
              <ClearIcon
                sx={{ fontSize: 'large', ml: 1 }}
                onClick={(e) => { e.stopPropagation(); clearFilter('type'); }}
              />
            </>
          ) : (
            <>
              <Typography variant="body2">Type</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: 1 }} />
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
        </div>

        {/* Category Filter */}
        <div id="category-button-container">
        <Button
          variant="contained"
          sx={{ color: 'common.black', bgcolor: 'grey.300', height: '30px', '&:hover': { bgcolor: 'grey.400' } }}
          onClick={(event) => handleFilterClick('category', event)}
        >
          {' '}
          {filters.category ? (
            <>
              {filters.category}{' '}
              <ClearIcon
                sx={{ fontSize: 'large', ml: 1 }}
                onClick={(e) => { e.stopPropagation(); clearFilter('category'); }}
              />
            </>
          ) : (
            <>
              <Typography variant="body2">Category</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: 1 }} />
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
        </div>

        {/* Status Filter */}
        <div id="status-button-container">
          <Button
            variant="contained"
            sx={{ color: 'common.black', bgcolor: 'grey.300', height: '30px', '&:hover': { bgcolor: 'grey.400' } }}
            onClick={(event) => handleFilterClick('status', event)}
          >
            {filters.status ? (
              <>
                {filters.status}{' '}
                <ClearIcon
                  sx={{ fontSize: 'large', ml: 1 }}
                  onClick={(e) => { e.stopPropagation(); clearFilter('status'); }}
                />
              </>
            ) : (
              <>
                <Typography variant="body2">Status</Typography>
                <ExpandMoreIcon sx={{ fontSize: 'large', ml: 1 }} />
              </>
            )}
          </Button>
          <Menu
            open={Boolean(anchors.status)}
            onClose={() => handleMenuClick('status', '')}
            anchorEl={anchors.status}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} onClick={() => handleMenuClick('status', status)}>
                {status}
              </MenuItem>
            ))}
          </Menu>
        </div>

        <Box sx={{ flexGrow: 1 }}>
          <SearchBar
            searchValue={filters.search}
            onSearchChange={handleSearch}
            compact
            placeholder="Search..."
            width="100%"
          />
        </Box>
    </Stack>
  );
};

export default InventoryFilter;
