import React, { useState, useEffect } from 'react';
import dummyData from './data.js';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Button } from '@mui/material';


const Inventory = () => {

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSearchCategory(event.target.value);
    console.log(event.target.value);
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  }

  const handleFilter = () => {
    const searchFiltered = dummyData.filter((dataItem) => {
      // Check if the item matches the search value
      const matchesSearch = dataItem.item.toLowerCase().includes(searchValue.toLowerCase());

      // Check if the item matches the selected category or if no category is selected
      const matchesCategory = !searchCategory || dataItem.category === searchCategory;

      // Return true if both conditions are met
      return matchesSearch && matchesCategory;
    });

    setData(searchFiltered);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const columns = [
    {
      id: 'item',
      numeric: false,
      disablePadding: true,
      label: 'Item',
    },
    {
      id: 'type',
      numeric: false,
      disablePadding: true,
      label: 'Type',
    },
    {
      id: 'category',
      numeric: false,
      disablePadding: true,
      label: 'Category',
    },
    {
      id: 'inStock',
      numeric: false,
      disablePadding: true,
      label: 'In Stock?',
    },
    {
      id: 'quantity',
      numeric: true,
      disablePadding: true,
      label: 'Quantity',
    },
  ]

  useEffect(() => {
    setData(dummyData);
  }, [])

  return (
    <Box>
      <Box id="filter-container">
        <TextField label="Search" placeholder="Item, type, etc..." type="search" onChange={handleSearchChange}/>
        <FormControl sx={{ ml: 2, minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            value={searchCategory}
            onChange={handleCategoryChange}
          >
            <MenuItem value="" >None</MenuItem>
            <MenuItem value="Household">Household</MenuItem>
            <MenuItem value="Toiletries">Toiletries</MenuItem>
            <MenuItem value="Stationery">Stationery</MenuItem>
            <MenuItem value="Food">Food</MenuItem>
            <MenuItem value="Clothing">Clothing</MenuItem>
          </Select>
        </FormControl>
        <Button sx={{ my: 1 }} onClick={handleFilter}>
          <FilterAltIcon fontSize="medium" />
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                '& td, & th': { borderBottom: '1px solid rgba(224, 224, 224, 1)' }
              }}>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="left"
                >
                  <TableSortLabel
                    sx={{ fontWeight: 'bold' }}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  cursor: 'pointer',
                  '& td, & th': { borderBottom: '1px solid rgba(224, 224, 224, 1)' }
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                  />
                </TableCell>
                <TableCell scope="row" align="left">{row.item}</TableCell>
                <TableCell align="left">{row.type}</TableCell>
                <TableCell align="left">{row.category}</TableCell>
                <TableCell align="left">{row.inStock}</TableCell>
                <TableCell align="left">{row.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 30]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  )
}

export default Inventory;