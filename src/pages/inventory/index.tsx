import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Button, Menu, Pagination, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import { createClient } from '@supabase/supabase-js';
import AddIcon from '@mui/icons-material/Add';
import Paper from '@mui/material/Paper';

type InventoryItem = {
  id: number;
  item: string;
  type: string;
  quantity: number;
  category: string;
  status: string;
}

const Inventory = () => {

  const [originalData, setOriginalData] = useState<InventoryItem[]>([]);
  const [data, setData] = useState<InventoryItem[]>([]);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [anchorType, setAnchorType] = useState<null | HTMLElement>(null);
  const [anchorCategory, setAnchorCategory] = useState<null | HTMLElement>(null);
  const [anchorStatus, setAnchorStatus] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handleTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorType(event.currentTarget);
  };
  const handleCategoryClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorCategory(event.currentTarget);
  };
  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorStatus(event.currentTarget);
  };

  const handleTypeClose = () => {
    setAnchorType(null);
  }

  const handleMenuTypeClick = (value: string) => {
    setType(value)
    // handleFilter(); Already called in the useEffect
    handleTypeClose();
  }

  const handleCategoryClose = () => {
    setAnchorCategory(null);
  }

  const handleMenuCategoryClick = (value: string) => {
    setCategory(value);
    handleFilter();
    handleCategoryClose();
  }

  const handleStatusClose = () => {
    setAnchorStatus(null);
  }

  const handleMenuStatusClick = (value: string) => {
    setStatus(value);
    handleFilter();
    handleStatusClose();
  }

  const clearTypeFilter = () => {
    setType('');
  }

  const clearCategoryFilter = () => {
    setCategory('');
  }

  const clearStatusFilter = () => {
    setStatus('');
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  }

  const handleFilter = () => {
    const searchFiltered = originalData.filter((row: { item: string, type: string, category: string, quantity: number; status: string }) => {

      const matchesType = type ? row.type.toLowerCase().includes(type.toLowerCase()) : true;

      const matchesCategory = category ? row.category.toLowerCase().includes(category.toLowerCase()) : true;

      const matchesStatus = status ? row.status.toLowerCase().includes(status.toLowerCase()) : true;

      const lowerCaseSearch = search.toLowerCase();

      const matchesSearch = search
        ? row.item.toLowerCase().includes(lowerCaseSearch) ||
        row.type.toLowerCase().includes(lowerCaseSearch) ||
        row.category.toLowerCase().includes(lowerCaseSearch) ||
        row.status.toLowerCase().includes(lowerCaseSearch) ||
        row.quantity.toString().toLowerCase().includes(lowerCaseSearch)
        : true;

      return matchesType && matchesCategory && matchesSearch && matchesStatus;
    });

    setData(searchFiltered);
  };

  const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY); // When we deploy this application or when we create a server, this will have to be changed to server side so that the anon_key can be hidden.

  const fetchData = async () => {
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select(`id, item, type, quantity, category, status`);

    if (error) {
      console.error('Error fetching inventory:', error)
    } else {
      console.log(inventory);
      setOriginalData(inventory);
      setData(inventory)
    }
  }

  useEffect(() => {
    if (type || category || status || search) {
      const handler = setTimeout(() => {
        handleFilter();
      }, 300); // Reduces calls to filter while typing in search
      return () => {
        clearTimeout(handler);
      };
      // handleFilter()
    } else {
      fetchData();
    }
  }, [type, category, status, search])

  return (
    <Box>

      {/* Add button */}
      <Box id="add-container" sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button sx={{ bgcolor: '#F5F5F5', color: 'black' }}><AddIcon fontSize="small" sx={{ color: 'black' }} />Add</Button>
      </Box>

      {/* Filter Container */}
      <Box id="filter-container" sx={{ display: 'flex', alignItems: 'center', maxWidth: '90%' }}>
        <Typography variant="body2">Filters</Typography>

        {/* Type Filter */}
        <Box sx={{ px: '8px' }} id="type-button-container">
          <Button sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }} onClick={handleTypeClick}>
            {type ? (
              <>{type} <ClearIcon sx={{ fontSize: 'large', ml: '6px' }} onClick={clearTypeFilter} /></>
            ) : (<><Typography variant="body2">Type</Typography><ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} /></>)}
          </Button>
          <Menu
            open={Boolean(anchorType)}
            onClose={handleTypeClose}
            anchorEl={anchorType}
          >
            <MenuItem onClick={() => handleMenuTypeClick('Donation')}>Donation</MenuItem>
            <MenuItem onClick={() => handleMenuTypeClick('Welcome Basket')}>Welcome Basket</MenuItem>
          </Menu>
        </Box>

        {/* Category Filter */}
        <Box sx={{ px: '8px' }} id="category-button-container">
          <Button sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }} onClick={handleCategoryClick}>       {category ? (
            <>{category} <ClearIcon sx={{ fontSize: 'large', ml: '6px' }} onClick={clearCategoryFilter} /></>
          ) : (<><Typography variant="body2">Category</Typography><ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} /></>)}</Button>
          <Menu
            open={Boolean(anchorCategory)}
            onClose={handleCategoryClose}
            anchorEl={anchorCategory}
          >
            <MenuItem onClick={() => handleMenuCategoryClick('Beddings & Linens')}>Beddings & Linens</MenuItem>
            <MenuItem onClick={() => handleMenuCategoryClick('Bath & Toiletries')}>Bath & Toiletries</MenuItem>
            <MenuItem onClick={() => handleMenuCategoryClick('Kitchenware')}>Kitchenware</MenuItem>
            <MenuItem onClick={() => handleMenuCategoryClick('Decorative & Home improvement')}>Decorative & Home improvement</MenuItem>
            <MenuItem onClick={() => handleMenuCategoryClick('Health & Medical')}>Health & Medical</MenuItem>
            <MenuItem onClick={() => handleMenuCategoryClick('Food')}>Food</MenuItem>
            <MenuItem onClick={() => handleMenuCategoryClick('Electronics & Appliances')}>Electronics & Appliances</MenuItem>
            <MenuItem onClick={() => handleMenuCategoryClick('Games, Books, Entertainment')}>Games, Books, Entertainment</MenuItem>
          </Menu>
        </Box>

        {/* Status Filter */}
        <Box sx={{ px: '8px' }} id="status-button-container">
          <Button sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }} onClick={handleStatusClick}>
            {status ? (
              <>{status} <ClearIcon sx={{ fontSize: 'large', ml: '6px' }} onClick={clearStatusFilter} /></>
            ) : (<><Typography variant="body2">Status</Typography><ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} /></>)}</Button>
          <Menu
            open={Boolean(anchorStatus)}
            onClose={handleStatusClose}
            anchorEl={anchorStatus}
          >
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


      {/* Inventory Table */}
      <Box id="inventory-container">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.map((row, index) => (
                <TableRow
                  key={index}
                  component={Paper}
                  sx={{
                    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1), 0px 1px 4px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <TableCell>{row.item}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(data.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Box>
    </Box>
  )
}

export default Inventory;