/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useEffect } from 'react';
import { Box, Button, Stack } from '@mui/material';
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

 // Handle status toggle
const handleStatusToggle = async (userId: number) => {
  try {
    await updateUserStatus(userId);
    showSnackbar('User status updated successfully!', 'success');
  } catch (err) {
    const message =
      err instanceof Error
        ? `Error updating user: ${err.message}`
        : `Error updating user: ${String(err)}`;
    console.error('handleStatusToggle error:', err);
    showSnackbar(message, 'error');
  }
};

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Add Volunteer Modal */}
      <AddVolunteerModal
        addModal={addModalOpen}
        handleAddClose={closeAddModal}
        fetchData={refetch}
      />

      {/* Toolbar: filters + add */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', width: '100%', mt: 3, mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <UserFilters
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            roleFilter={roleFilter}
            onStatusFilterChange={setStatusFilter}
            onRoleFilterChange={setRoleFilter}
          />
        </Box>
        <Button variant="contained" onClick={openAddModal}>
          <AddIcon fontSize="small" />
          Add
        </Button>
      </Stack>

      {/* Users Table */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <UserTable
          users={filteredData}
          nameOrder={nameOrder}
          onNameOrderToggle={handleNameOrderToggle}
          onStatusToggle={handleStatusToggle}
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
