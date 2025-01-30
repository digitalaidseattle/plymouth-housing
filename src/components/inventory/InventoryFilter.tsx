import React from 'react';
import { Box, Button, Menu, MenuItem, Typography, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';

interface InventoryFilterProps {
  type: string;
  category: string;
  status: string;
  search: string;
  anchorType: null | HTMLElement;
  anchorCategory: null | HTMLElement;
  anchorStatus: null | HTMLElement;
  categoryData: Array<{ name: string }>;
  handleTypeClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleCategoryClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleStatusClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMenuTypeClick: (value: string) => void;
  handleMenuCategoryClick: (value: string) => void;
  handleMenuStatusClick: (value: string) => void;
  clearTypeFilter: () => void;
  clearCategoryFilter: () => void;
  clearStatusFilter: () => void;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InventoryFilter: React.FC<InventoryFilterProps> = ({
  type,
  category,
  status,
  search,
  anchorType,
  anchorCategory,
  anchorStatus,
  categoryData,
  handleTypeClick,
  handleCategoryClick,
  handleStatusClick,
  handleMenuTypeClick,
  handleMenuCategoryClick,
  handleMenuStatusClick,
  clearTypeFilter,
  clearCategoryFilter,
  clearStatusFilter,
  handleSearch,
}) => {
  return (
    <Box id="filter-container" sx={{ display: 'flex', alignItems: 'center', maxWidth: '90%' }}>
      <Typography variant="body2">Filters</Typography>

      {/* Type Filter */}
      <Box sx={{ px: '8px' }} id="type-button-container">
        <Button sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }} onClick={handleTypeClick}>
          {type ? (
            <>
              {type}{' '}
              <ClearIcon sx={{ fontSize: 'large', ml: '6px' }} onClick={clearTypeFilter} />
            </>
          ) : (
            <>
              <Typography variant="body2">Type</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu open={Boolean(anchorType)} onClose={() => setAnchorType(null)} anchorEl={anchorType}>
          <MenuItem onClick={() => handleMenuTypeClick('General')}>General</MenuItem>
          <MenuItem onClick={() => handleMenuTypeClick('Welcome Basket')}>Welcome Basket</MenuItem>
        </Menu>
      </Box>

      {/* Category Filter */}
      <Box sx={{ px: '8px' }} id="category-button-container">
        <Button sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }} onClick={handleCategoryClick}>
          {category ? (
            <>
              {category}{' '}
              <ClearIcon sx={{ fontSize: 'large', ml: '6px' }} onClick={clearCategoryFilter} />
            </>
          ) : (
            <>
              <Typography variant="body2">Category</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu open={Boolean(anchorCategory)} onClose={() => setAnchorCategory(null)} anchorEl={anchorCategory}>
          {categoryData.map((categoryItem) => (
            <MenuItem key={categoryItem.name} onClick={() => handleMenuCategoryClick(categoryItem.name)}>
              {categoryItem.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Status Filter */}
      <Box sx={{ px: '8px' }} id="status-button-container">
        <Button sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }} onClick={handleStatusClick}>
          {status ? (
            <>
              {status}{' '}
              <ClearIcon sx={{ fontSize: 'large', ml: '6px' }} onClick={clearStatusFilter} />
            </>
          ) : (
            <>
              <Typography variant="body2">Status</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu open={Boolean(anchorStatus)} onClose={() => setAnchorStatus(null)} anchorEl={anchorStatus}>
          <MenuItem onClick={() => handleMenuStatusClick('Low')}>Low</MenuItem>
          <MenuItem onClick={() => handleMenuStatusClick('Medium')}>Medium</MenuItem>
          <MenuItem onClick={() => handleMenuStatusClick('High')}>High</MenuItem>
        </Menu>
      </Box>

      {/* Search Filter */}
      <Box id="search-container" sx={{ ml: 'auto' }}>
        <TextField value={search} onChange={handleSearch} variant="standard" placeholder="Search" />
      </Box>
    </Box>
  );
};

export default InventoryFilter;
