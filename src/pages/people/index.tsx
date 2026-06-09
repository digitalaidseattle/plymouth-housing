import React, { useState, useEffect } from 'react';
import { SETTINGS } from '../../types/constants';
import { Box, Button, Pagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import AddVolunteerModal from '../../components/AddVolunteerModal/AddVolunteerModal';
import SnackbarAlert from '../../components/SnackbarAlert';
import { useSnackbar } from '../../hooks/useSnackbar';
import useUsers from './useUsers';

const UserPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [nameOrder, setNameOrder] = useState<'asc' | 'desc' | 'original'>(
    'original',
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = SETTINGS.itemsPerPage;
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { snackbarState, showSnackbar, handleClose: handleSnackbarClose } = useSnackbar();

  const {
    originalData,
    filteredData,
    setFilteredData,
    error,
    clearError,
    refetch,
    updateUserStatus,
  } = useUsers();

  // Handle filtering and sorting
  useEffect(() => {
    let filtered = [...originalData];

    // Filter by search
    if (search) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Filter by status
    if (statusFilter !== null) {
      filtered = filtered.filter((user) =>
        statusFilter === 'Active' ? user.active : !user.active,
      );
    }

    // Filter by role
    if (roleFilter !== null) {
      filtered = filtered.filter((user) =>
        user.role === roleFilter,
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
  }, [search, statusFilter, roleFilter, nameOrder, originalData, setFilteredData]);

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

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

  // Handle status toggle
  const handleStatusToggle = async (userId: number) => {
    try {
      await updateUserStatus(userId);
      showSnackbar('User status updated successfully!', 'success');
    } catch (error) {
      showSnackbar('Error updating user: ' + error, 'warning');
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
      <UserFilters
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
        onStatusFilterChange={setStatusFilter}
        onRoleFilterChange={setRoleFilter}
      />

      {/* Users Table */}
      <UserTable
        users={currentItems}
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

      {/* Error Snackbar from useUsers */}
      {error && (
        <SnackbarAlert
          open={true}
          onClose={clearError}
          severity="warning"
        >
          {error}
        </SnackbarAlert>
      )}

      {/* Action Snackbar */}
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

export default UserPage;