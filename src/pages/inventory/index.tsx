import React, { useContext, useState, useEffect, useCallback } from 'react';
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
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddIcon from '@mui/icons-material/Add';
import Paper from '@mui/material/Paper';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import AddItemModal from '../../components/AddItemModal/AddItemModal';
import { CategoryItem, InventoryItem } from '../../types/interfaces.ts';
import { ENDPOINTS, HEADERS, SETTINGS } from "../../types/constants"

const Inventory = () => {
  const {user} = useContext(UserContext);
  const [originalData, setOriginalData] = useState<InventoryItem[]>([]);
  const [displayData, setDisplayData] = useState<InventoryItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [itemAlph, setItemAlph] = useState<'asc' | 'desc' | 'original'>('original');
  const [addModal, setAddModal] = useState(false);
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

  const indexOfLastItem = currentPage * SETTINGS.itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - SETTINGS.itemsPerPage;
  const currentItems = displayData.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddOpen = () => {
    setAddModal(true)
  }

  const handleAddClose = () => {
    setAddModal(false)
  }

  const handleTypeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorType(event.currentTarget);
  };
  const handleCategoryClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorCategory(event.currentTarget);
  };
  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorStatus(event.currentTarget);
  };

  const itemAlphabetizeHandle = () => {
    if (itemAlph === 'asc') {
      setItemAlph('desc');
    } else if (itemAlph === 'desc') {
      setItemAlph('original');
    } else if (itemAlph === 'original') {
      setItemAlph('asc');
    }
  };

  const handleTypeClose = () => {
    setAnchorType(null);
  };

  const handleMenuTypeClick = (value: string) => {
    setType(value);
    handleTypeClose();
  };

  const handleCategoryClose = () => {
    setAnchorCategory(null);
  };

  const handleMenuCategoryClick = (value: string) => {
    setCategory(value);
    handleCategoryClose();
  };

  const handleStatusClose = () => {
    setAnchorStatus(null);
  };

  const handleMenuStatusClick = (value: string) => {
    setStatus(value);
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

  const handleFilter = useCallback(() => {
    const searchFiltered = originalData.filter(
      (row: {
        name: string;
        type: string;
        description: string;
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
          row.description.toLowerCase().includes(lowerCaseSearch) ||
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
  }, [type, category, status, search, itemAlph, originalData]);

  const fetchData = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.EXPANDED_ITEMS, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      const inventoryList = data.value;
      setOriginalData(inventoryList);
      setDisplayData(inventoryList);
    }
    catch (error) {
      console.error('Error fetching inventory:', error); //TODO show more meaningful error to end user.
  }
    setIsLoading(false);
  }, [user]);

  const fetchCategories = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.CATEGORY, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setCategoryData(data.value);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [user]);
  
  useEffect(() => {
    fetchData();
    fetchCategories();
  },[user, fetchData, fetchCategories]); 

  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilter();
    }, 300); // Reduces calls to filter while typing in search
    return () => {
      clearTimeout(handler);
    };
  }, [type, category, status, search, handleFilter]);

  useEffect(() => {
    handleFilter();
  }, [itemAlph, handleFilter]);

  if (isLoading) {
    return <p>Loading ...</p>;
  }

  return (
    <Box>
      {/* Add button */}
      <Box id="add-container" sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button sx={{ bgcolor: '#F5F5F5', color: 'black' }} onClick={handleAddOpen}>
          <AddIcon fontSize="small" sx={{ color: 'black' }} />
          Add/Update
        </Button>
      </Box>
{ 
      <AddItemModal 
        addModal={addModal} 
        handleAddClose={handleAddClose}   
        fetchData={fetchData}
        categoryData={categoryData}
        originalData={originalData} /> }

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
            <MenuItem onClick={() => handleMenuTypeClick('General')}>
              General
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
            {categoryData.map((categoryItem) => (
              <MenuItem
                key={categoryItem.name}
                onClick={() => handleMenuCategoryClick(categoryItem.name)}
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
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={itemAlphabetizeHandle}
                >
                  Name
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
          count={Math.ceil(displayData.length / SETTINGS.itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Box>
    </Box>
  );
};

export default Inventory;