import React, { useState, useEffect } from 'react';
import { Box, Button, Pagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VolunteerFilters from './VolunteerFilters';
import VolunteerTable from './VolunteerTable';
import AddVolunteerModal from '../../components/AddVolunteerModal/AddVolunteerModal';
import SnackbarAlert from '../../pages/authentication/SnackbarAlert';
import useVolunteers from './useVolunteers';

const VolunteerPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [nameOrder, setNameOrder] = useState<'asc' | 'desc' | 'original'>(
    'original',
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning';
  }>({ open: false, message: '', severity: 'warning' });

  const {
    originalData,
    filteredData,
    setFilteredData,
    error,
    refetch,
    updateVolunteerStatus,
  } = useVolunteers();

  // Handle filtering and sorting
  useEffect(() => {
    let filtered = [...originalData];

    // Filter by search
    if (search) {
      filtered = filtered.filter((volunteer) =>
        volunteer.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Filter by status
    if (statusFilter !== null) {
      filtered = filtered.filter((volunteer) =>
        statusFilter === 'Active' ? volunteer.active : !volunteer.active,
      );
    }

    // Sort by name
    if (nameOrder !== 'original') {
      filtered.sort((a, b) =>
        nameOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );
    }

    setFilteredData(filtered);
  }, [search, statusFilter, nameOrder, originalData, setFilteredData]);

  const handleNameOrderToggle = () => {
    setNameOrder((prevOrder) =>
      prevOrder === 'asc' ? 'desc' : prevOrder === 'desc' ? 'original' : 'asc',
    );
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarState({ ...snackbarState, open: false });
  };

  useEffect(() => {
    if (error) {
      setSnackbarState({ open: true, message: error, severity: 'warning' });
    }
  }, [error]);

  // Handle status toggle
  const handleStatusToggle = async (volunteerId: number) => {
    try {
      await updateVolunteerStatus(volunteerId);
      setSnackbarState({
        open: true,
        message: 'Volunteer status updated successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbarState({
        open: true,
        message: 'Error updating volunteer: ' + error,
        severity: 'warning',
      });
    }
  };

  return (
    <Box>
      {/* Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button
          sx={{ bgcolor: '#F5F5F5', color: 'black' }}
          onClick={openAddModal}
        >
          <AddIcon fontSize="small" sx={{ color: 'black' }} />
          Add
        </Button>
      </Box>

      {/* Add Volunteer Modal */}
      <AddVolunteerModal
        addModal={addModalOpen}
        handleAddClose={closeAddModal}
        fetchData={refetch}
      />

      {/* Filters */}
      <VolunteerFilters
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Volunteers Table */}
      <VolunteerTable
        volunteers={currentItems}
        nameOrder={nameOrder}
        onNameOrderToggle={handleNameOrderToggle}
        onStatusToggle={handleStatusToggle}
      />

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Box>

      {/* Snackbar */}
      <SnackbarAlert
        open={snackbarState.open}
        onClose={handleSnackbarClose}
        severity={snackbarState.severity}
      >
        {snackbarState.message}
      </SnackbarAlert>
    </Box>
  );
};

export default VolunteerPage;
