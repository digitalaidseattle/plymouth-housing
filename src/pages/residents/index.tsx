import React, { useState, useEffect } from 'react';
import { Box, Button, Pagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ResidentFilter from './ResidentFilter';
import ResidentTable from './ResidentTable';
import AddResidentModal from './AddResidentModal';
import EditResidentModal from './EditResidentModal';
import SnackbarAlert from '../../components/SnackbarAlert';
import useResidents from './useResidents';
import { ResidentWithUnit } from '../../types/interfaces';

const ResidentsPage = () => {
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<number | null>(null);
  const [unitFilter, setUnitFilter] = useState<number | null>(null);
  const [nameOrder, setNameOrder] = useState<'asc' | 'desc' | 'original'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentWithUnit | null>(null);
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
    clearError,
    refetch,
  } = useResidents();

  // Handle filtering and sorting
  useEffect(() => {
    let filtered = [...originalData];

    // Filter by search
    if (search) {
      filtered = filtered.filter((resident) =>
        resident.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Filter by building
    if (buildingFilter !== null) {
      filtered = filtered.filter((resident) =>
        resident.building_id === buildingFilter,
      );
    }

    // Filter by unit
    if (unitFilter !== null) {
      filtered = filtered.filter((resident) =>
        resident.unit_id === unitFilter,
      );
    }

    // Sort by name - default is alphabetical (asc)
    if (nameOrder !== 'original') {
      filtered.sort((a, b) =>
        nameOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );
    }

    setFilteredData(filtered);
  }, [search, buildingFilter, unitFilter, nameOrder, originalData, setFilteredData]);

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

  const openEditModal = (resident: ResidentWithUnit) => {
    setSelectedResident(resident);
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedResident(null);
    setEditModalOpen(false);
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarState({ ...snackbarState, open: false });
  };

  const handleAddSuccess = () => {
    refetch();
    setSnackbarState({
      open: true,
      message: 'Resident added successfully!',
      severity: 'success',
    });
  };

  const handleEditSuccess = () => {
    refetch();
    setSnackbarState({
      open: true,
      message: 'Resident updated successfully!',
      severity: 'success',
    });
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

      {/* Add Resident Modal */}
      <AddResidentModal
        open={addModalOpen}
        onClose={closeAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Resident Modal */}
      <EditResidentModal
        open={editModalOpen}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
        resident={selectedResident}
      />

      {/* Filters */}
      <ResidentFilter
        search={search}
        onSearchChange={handleSearchChange}
        buildingFilter={buildingFilter}
        onBuildingFilterChange={setBuildingFilter}
        unitFilter={unitFilter}
        onUnitFilterChange={setUnitFilter}
      />

      {/* Residents Table */}
      <ResidentTable
        residents={currentItems}
        nameOrder={nameOrder}
        onNameOrderToggle={handleNameOrderToggle}
        onEditResident={openEditModal}
      />

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Box>

      {/* Error Snackbar from useResidents */}
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

export default ResidentsPage;
