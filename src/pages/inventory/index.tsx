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
import { Button, Menu, Modal, Pagination, Select, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
//import { createClient } from '@supabase/supabase-js';
import AddIcon from '@mui/icons-material/Add';
import Paper from '@mui/material/Paper';

type InventoryItem = {
  id: number;
  name: string;
  type: string;
  quantity: number;
  category: string;
  status: string;
};

const API = "/data-api/rest/item";
const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8' };

const Inventory = () => {
  const [originalData, setOriginalData] = useState<InventoryItem[]>([]);
  const [displayData, setDisplayData] = useState<InventoryItem[]>([]);
  const [itemAlph, setItemAlph] = useState<'asc' | 'desc' | 'original'>('original');
  const [addModal, setAddModal] = useState(false);
  const [addItemType, setAddItemType] = useState('');
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [anchorType, setAnchorType] = useState<null | HTMLElement>(null);
  const [anchorCategory, setAnchorCategory] = useState<null | HTMLElement>(
    null,
  );
  const [anchorStatus, setAnchorStatus] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayData.slice(indexOfFirstItem, indexOfLastItem);

  const handleTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorType(event.currentTarget);
  };
  const handleCategoryClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorCategory(event.currentTarget);
  };
  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorStatus(event.currentTarget);
  };
  const handleAddClick = () => {
    setAddModal(true)
  }

  const handleAddClose = () => {
    setAddModal(false)
  }

  const handleAddItemType = (event: { target: { value: string } }) => {
    setAddItemType(event.target.value)
  }

  const itemAlphabetizeHandle = () => {
    if (itemAlph === 'asc') {
      setItemAlph('desc');
    } else if (itemAlph === 'desc') {
      setItemAlph('original');
    } else if (itemAlph === 'original') {
      setItemAlph('asc');
    }
  }

  const handleTypeClose = () => {
    setAnchorType(null);
  };

  const handleMenuTypeClick = (value: string) => {
    setType(value);
    // handleFilter(); Already called in the useEffect
    handleTypeClose();
  };

  const handleCategoryClose = () => {
    setAnchorCategory(null);
  };

  const handleMenuCategoryClick = (value: string) => {
    setCategory(value);
    handleFilter();
    handleCategoryClose();
  };

  const handleStatusClose = () => {
    setAnchorStatus(null);
  };

  const handleMenuStatusClick = (value: string) => {
    setStatus(value);
    handleFilter();
    handleStatusClose();
  };

  const clearTypeFilter = () => {
    setType('');
  };

  const clearCategoryFilter = () => {
    setCategory('');
  };

  const clearStatusFilter = () => {
    setStatus('');
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
  };

  const handleFilter = () => {
    const searchFiltered = originalData.filter(
      (row: {
        name: string;
        type: string;
        category: string;
        quantity: number;
        status: string;
      }) => {
        const matchesType = type
          ? row.type.toLowerCase().includes(type.toLowerCase())
          : true;

        const matchesCategory = category
          ? row.category.toLowerCase().includes(category.toLowerCase())
          : true;

        const matchesStatus = status
          ? row.status.toLowerCase().includes(status.toLowerCase())
          : true;

        const lowerCaseSearch = search.toLowerCase();

        const matchesSearch = search
          ? row.name.toLowerCase().includes(lowerCaseSearch) ||
          row.type.toLowerCase().includes(lowerCaseSearch) ||
          row.category.toLowerCase().includes(lowerCaseSearch) ||
          row.status.toLowerCase().includes(lowerCaseSearch) ||
          row.quantity.toString().toLowerCase().includes(lowerCaseSearch)
          : true;

        return matchesType && matchesCategory && matchesSearch && matchesStatus;
      },
    );

    if (itemAlph === 'asc') {
      searchFiltered.sort((a, b) => a.name.localeCompare(b.name)); // Ascending A-Z
    } else if (itemAlph === 'desc') {
      searchFiltered.sort((a, b) => b.name.localeCompare(a.name)); // Descending Z-A
    }

    setDisplayData(searchFiltered);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(API, { headers: HEADERS, method: "GET" });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      console.log(data.value)
      setOriginalData(data.value);
      setDisplayData(data.value);
    }
    catch (error) {
      console.error('Error fetching inventory:', error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <p>Loading ...</p>;
  }

  useEffect(() => {
    if (type || category || status || search) {
      // console.log('database_connection_string:', process.env.DATABASE_CONNECTION_STRING);
      const handler = setTimeout(() => {
        handleFilter();
      }, 300); // Reduces calls to filter while typing in search
      return () => {
        clearTimeout(handler);
      };
      // handleFilter()
    } else {
      // console.log('database_connection_string:', process.env.DATABASE_CONNECTION_STRING);
      fetchData();
    }
  }, [type, category, status, search]);

  useEffect(() => {
    handleFilter();
  }, [itemAlph])

  return (
    <Box>
      {/* Add button */}
      <Box id="add-container" sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button sx={{ bgcolor: '#F5F5F5', color: 'black' }} onClick={handleAddClick}>
          <AddIcon fontSize="small" sx={{ color: 'black' }} />
          Add
        </Button>
        <Modal
          open={addModal}
          onClose={handleAddClose}
        >
          <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50%', height: '50%', backgroundColor: 'white' }}>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', width: '80%', margin: 'auto', height: '100%'}}>
              <Typography>
                Add Item
              </Typography>
              <Box id="add-item-type">
                <Typography>
                  Item Type
                </Typography>
                <Select
                  value={addItemType}
                  onChange={handleAddItemType}
                  sx={{ minWidth: '200px' }}
                >
                  <MenuItem value={'Donation'}>Donation</MenuItem>
                  <MenuItem value={'Welcome Basket'}>Welcome Basket</MenuItem>
                </Select>
              </Box>
              <Box id="add-item-name">
                <Typography>
                  Item
                </Typography>
                <TextField></TextField>
              </Box>
              <Box id="add-item-quantity">
                <Typography>
                  Quantity
                </Typography>
                <TextField></TextField>
              </Box>
            </Box>
          </Box>
        </Modal>
      </Box>

      {/* Filter Container */}
      <Box
        id="filter-container"
        sx={{ display: 'flex', alignItems: 'center', maxWidth: '90%' }}
      >
        <Typography variant="body2">Filters</Typography>

        {/* Type Filter */}
        <Box sx={{ px: '8px' }} id="type-button-container">
          <Button
            sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
            onClick={handleTypeClick}
          >
            {type ? (
              <>
                {type}{' '}
                <ClearIcon
                  sx={{ fontSize: 'large', ml: '6px' }}
                  onClick={clearTypeFilter}
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
            open={Boolean(anchorType)}
            onClose={handleTypeClose}
            anchorEl={anchorType}
          >
            <MenuItem onClick={() => handleMenuTypeClick('Donation')}>
              Donation
            </MenuItem>
            <MenuItem onClick={() => handleMenuTypeClick('Welcome Basket')}>
              Welcome Basket
            </MenuItem>
          </Menu>
        </Box>

        {/* Category Filter */}
        <Box sx={{ px: '8px' }} id="category-button-container">
          <Button
            sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
            onClick={handleCategoryClick}
          >
            {' '}
            {category ? (
              <>
                {category}{' '}
                <ClearIcon
                  sx={{ fontSize: 'large', ml: '6px' }}
                  onClick={clearCategoryFilter}
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
            open={Boolean(anchorCategory)}
            onClose={handleCategoryClose}
            anchorEl={anchorCategory}
          >
            <MenuItem
              onClick={() => handleMenuCategoryClick('Beddings & Linens')}
            >
              Beddings & Linens
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuCategoryClick('Bath & Toiletries')}
            >
              Bath & Toiletries
            </MenuItem>
            <MenuItem onClick={() => handleMenuCategoryClick('Kitchenware')}>
              Kitchenware
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleMenuCategoryClick('Decorative & Home improvement')
              }
            >
              Decorative & Home improvement
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuCategoryClick('Health & Medical')}
            >
              Health & Medical
            </MenuItem>
            <MenuItem onClick={() => handleMenuCategoryClick('Food')}>
              Food
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleMenuCategoryClick('Electronics & Appliances')
              }
            >
              Electronics & Appliances
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleMenuCategoryClick('Games, Books, Entertainment')
              }
            >
              Games, Books, Entertainment
            </MenuItem>
          </Menu>
        </Box>

        {/* Status Filter */}
        <Box sx={{ px: '8px' }} id="status-button-container">
          <Button
            sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
            onClick={handleStatusClick}
          >
            {status ? (
              <>
                {status}{' '}
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
            <MenuItem onClick={() => handleMenuStatusClick('Low')}>
              Low
            </MenuItem>
            <MenuItem onClick={() => handleMenuStatusClick('Medium')}>
              Medium
            </MenuItem>
            <MenuItem onClick={() => handleMenuStatusClick('High')}>
              High
            </MenuItem>
          </Menu>
        </Box>

        {/* Search Filter */}
        <Box id="search-container" sx={{ ml: 'auto' }}>
          <TextField
            value={search}
            onChange={handleSearch}
            variant="standard"
            placeholder="Search"
          />
        </Box>
      </Box>

      {/* Inventory Table */}
      <Box id="inventory-container">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={itemAlphabetizeHandle}>Name
                  {itemAlph === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" sx={{ fontWeight: 'normal', ml: 0.5, color: 'gray' }} />
                  ) : itemAlph === 'desc' ? (
                    <ArrowDownwardIcon fontSize="small" sx={{ fontWeight: 'normal', ml: 0.5, color: 'gray' }} />
                  ) : null}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.map((row, index) => (
                <TableRow
                  key={index}
                  component={Paper}
                  sx={{
                    boxShadow:
                      '0px 3px 6px rgba(0, 0, 0, 0.1), 0px 1px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <TableCell>{row.name}</TableCell>
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
          count={Math.ceil(displayData.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Box>
    </Box>
  );
};

export default Inventory;