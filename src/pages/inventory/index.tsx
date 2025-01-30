import React, { useContext, useState, useEffect, useCallback } from 'react';

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, Pagination, Tooltip, Paper } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddIcon from '@mui/icons-material/Add';

import { getRole, UserContext } from '../../components/contexts/UserContext';
import { CategoryItem, InventoryItem } from '../../types/interfaces.ts';
import { ENDPOINTS, HEADERS, SETTINGS } from "../../types/constants";
import AddItemModal from '../../components/inventory/AddItemModal.tsx';
import InventoryFilter from '../../components/inventory/InventoryFilter.tsx';

const Inventory = () => {
  const { user } = useContext(UserContext);
  const [originalData, setOriginalData] = useState<InventoryItem[]>([]);
  const [displayData, setDisplayData] = useState<InventoryItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [itemAlph, setItemAlph] = useState<'asc' | 'desc' | 'original'>('original');
  const [addModal, setAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    search: '',
  });
  const [anchors, setAnchors] = useState({
    type: null as null | HTMLElement,
    category: null as null | HTMLElement,
    status: null as null | HTMLElement,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * SETTINGS.itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - SETTINGS.itemsPerPage;
  const currentItems = displayData.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddOpen = () => {
    setAddModal(true);
  };

  const handleAddClose = () => {
    setAddModal(false);
  };

  // Consolidated function for handling all filter clicks
  const handleFilterClick = (filter: 'type' | 'category' | 'status', event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchors((prev) => ({ ...prev, [filter]: event.currentTarget }));
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

  const handleMenuClose = (menu: keyof typeof anchors) => {
    setAnchors((prev) => ({ ...prev, [menu]: null }));
  };

  // Consolidated function for handling all menu item clicks (type, category, status)
  const handleMenuClick = (filter: 'type' | 'category' | 'status', value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: value,
    }));
    handleMenuClose(filter);
  };

  // Consolidated filter clearing function
  const clearFilter = (filter: 'type' | 'category' | 'status') => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: '',
    }));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: event.target.value,
    }));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
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
        const matchesType = filters.type
          ? row.type.toLowerCase().includes(filters.type.toLowerCase())
          : true;

        const matchesCategory = filters.category
          ? row.category.toLowerCase().includes(filters.category.toLowerCase())
          : true;

        const matchesStatus = filters.status
          ? row.status.toLowerCase().includes(filters.status.toLowerCase())
          : true;

        const lowerCaseSearch = filters.search.toLowerCase();

        const matchesSearch = filters.search
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
    setCurrentPage(1);
  }, [filters, itemAlph, originalData]);

  const fetchData = useCallback(async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.EXPANDED_ITEMS + '?$first=10000', { headers: HEADERS, method: 'GET' });
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
  }, [user, fetchData, fetchCategories]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilter();
    }, 300); // Reduces calls to filter while typing in search
    return () => {
      clearTimeout(handler);
    };
  }, [filters, handleFilter]);

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
          Add
        </Button>
      </Box>

      <AddItemModal
        addModal={addModal}
        handleAddClose={handleAddClose}
        fetchData={fetchData}
        originalData={originalData}
      />

      {/* Inventory Filter */}
      <InventoryFilter
        filters={filters}
        anchors={anchors}
        categoryData={categoryData}
        handleFilterClick={handleFilterClick}
        handleMenuClick={handleMenuClick}
        clearFilter={clearFilter}
        handleSearch={handleSearch}
      />

      {/* Inventory Table */}
      <Box id="inventory-container" sx={{ marginY: '10px' }}>
        <TableContainer component={Paper}>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    width: '20%',
                  }}
                  onClick={itemAlphabetizeHandle}
                >
                  Name
                  {itemAlph === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" sx={{ fontWeight: 'normal', ml: 0.5, color: 'gray' }} />
                  ) : itemAlph === 'desc' ? (
                    <ArrowDownwardIcon fontSize="small" sx={{ fontWeight: 'normal', ml: 0.5, color: 'gray' }} />
                  ) : null}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '12.5%' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '12.5%' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '12.5%' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '12.5%' }}>Quantity</TableCell>
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
                  <TableCell sx={{ width: '20%' }}>{row.name}</TableCell>
                  <TableCell sx={{
                    width: '30%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                  }}>
                    <Tooltip title={row.description} arrow>
                      <span>{row.description}</span>
                    </Tooltip>
                  </TableCell>

                  <TableCell sx={{ width: '12,5%' }}>{row.type}</TableCell>
                  <TableCell sx={{ width: '12.5%' }}>{row.category}</TableCell>
                  <TableCell sx={{ width: '12.5%' }}>
                    <Chip
                      label={row.status}
                      sx={{
                        backgroundColor: row.status === 'Low' ? '#FDECEA' : row.status === 'Medium' ? '#FFF9C4' : '#E6F4EA',
                        color: row.status === 'Low' ? '#D32F2F' : row.status === 'Medium' ? '#6A4E23' : '#357A38',
                        borderRadius: '8px',
                        px: 1.5,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: '12.5%' }}>{row.quantity}</TableCell>
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
