import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { Button, Pagination, Typography, Chip, Paper, Menu, MenuItem } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import AddVolunteerModal from '../../components/AddVolunteerModal/AddVolunteerModal';
import { Volunteer } from '../../types/interfaces';
import SnackbarAlert from '../../pages/authentication/SnackbarAlert'; 

const VOLUNTEERS_API = '/data-api/rest/volunteer';
const HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=utf-8',
};

const VolunteerPage = () => {
  const [originalData, setOriginalData] = useState<Volunteer[]>([]);
  const [displayData, setDisplayData] = useState<Volunteer[]>([]);
  const [nameOrder, setNameOrder] = useState<'asc' | 'desc' | 'original'>('original');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [anchorStatus, setAnchorStatus] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
  'success' | 'warning'
>('warning');
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayData.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleNameOrderToggle = () => {
    setNameOrder(nameOrder === 'asc' ? 'desc' : nameOrder === 'desc' ? 'original' : 'asc');
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorStatus(event.currentTarget);
  };

  const handleStatusClose = () => {
    setAnchorStatus(null);
  };

  const handleStatusFilterClick = (status: string | null) => {
    setStatusFilter(status);
    setAnchorStatus(null);
  };

  const clearStatusFilter = () => {
    setStatusFilter(null);
  };

  const handleFilter = () => {
    let filteredData = originalData.filter((volunteer) => {
      const matchesSearch = volunteer.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === null || (statusFilter === 'Active' ? volunteer.active : !volunteer.active);
      return matchesSearch && matchesStatus;
    });

    if (nameOrder === 'asc') {
      filteredData = filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (nameOrder === 'desc') {
      filteredData = filteredData.sort((a, b) => b.name.localeCompare(a.name));
    }

    setDisplayData(filteredData);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(VOLUNTEERS_API, { headers: HEADERS, method: 'GET' });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      setOriginalData(data.value);
      setDisplayData(data.value);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setSnackbarMessage('Error fetching volunteers: '+ error);
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
    }
  };
    const handleSnackbarClose = (
      _event?: React.SyntheticEvent | Event,
      reason?: string,
    ) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpenSnackbar(false);
    };
  useEffect(() => {
    if (search) {
      const handler = setTimeout(() => {
        handleFilter();
      }, 300);
      return () => clearTimeout(handler);
    } else {
      fetchData();
    }
  }, [search]);

  useEffect(() => {
    handleFilter();
  }, [nameOrder, statusFilter]);

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

  return (
    <Box>
      {/* Add Button */}
      <Box id="add-container" sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button sx={{ bgcolor: '#F5F5F5', color: 'black' }} onClick={openAddModal}>
          <AddIcon fontSize="small" sx={{ color: 'black' }} />
          Add
        </Button>
      </Box>

      {/* Add Volunteer Modal */}
      <AddVolunteerModal addModal={addModalOpen} handleAddClose={closeAddModal} fetchData={fetchData} />

      {/* Search and Status Filter Container */}
      <Box id="filter-container" sx={{ display: 'flex', alignItems: 'center', maxWidth: '90%' }}>
        <Typography variant="body2">Filters</Typography>

        {/* Status Filter */}
        <Box sx={{ px: '8px' }} id="status-button-container">
          <Button sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }} onClick={handleStatusClick}>
            {statusFilter ? (
              <>
                {statusFilter}{' '}
                <ClearIcon sx={{ fontSize: 'large', ml: '6px' }} onClick={clearStatusFilter} />
              </>
            ) : (
              <>
                <Typography variant="body2">Status</Typography>
                <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
              </>
            )}
          </Button>
          <Menu open={Boolean(anchorStatus)} onClose={handleStatusClose} anchorEl={anchorStatus}>
            <MenuItem onClick={() => handleStatusFilterClick('Active')}>Active</MenuItem>
            <MenuItem onClick={() => handleStatusFilterClick('Inactive')}>Inactive</MenuItem>
          </Menu>
        </Box>

        {/* Search Filter */}
        <Box id="search-container" sx={{ ml: 'auto' }}>
          <TextField value={search} onChange={handleSearch} variant="standard" placeholder="Search" />
        </Box>
      </Box>

      {/* Volunteers Table */}
      <Box id="volunteer-container">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onClick={handleNameOrderToggle}
                >
                  Name
                  {nameOrder === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" sx={{ fontWeight: 'normal', ml: 0.5, color: 'gray' }} />
                  ) : nameOrder === 'desc' ? (
                    <ArrowDownwardIcon fontSize="small" sx={{ fontWeight: 'normal', ml: 0.5, color: 'gray' }} />
                  ) : null}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Signed In Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.map((volunteer, index) => (
                <TableRow
                  key={index}
                  component={Paper}
                  sx={{
                    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1), 0px 1px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <TableCell>{volunteer.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={volunteer.active ? 'Active' : 'Inactive'}
                      sx={{
                        backgroundColor: volunteer.active ? '#E6F4EA' : '#FDECEA',
                        color: volunteer.active ? '#357A38' : '#D32F2F',
                        borderRadius: '8px',
                        px: 1.5,
                      }}
                    />
                  </TableCell>
                  <TableCell>  { new Date(volunteer.created_at).toLocaleDateString() }</TableCell>
                  <TableCell>  {volunteer.last_signed_in ? new Date(volunteer.last_signed_in).toLocaleDateString() : 'None'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={Math.ceil(displayData.length / itemsPerPage)} page={currentPage} onChange={handlePageChange} />
      </Box>


        <SnackbarAlert
          open={openSnackbar}
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
        >{snackbarMessage}
        </SnackbarAlert>


    </Box>
  );
};

export default VolunteerPage;