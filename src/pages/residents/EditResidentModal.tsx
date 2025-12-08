import { useContext, useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { Building, Unit, ResidentWithUnit } from '../../types/interfaces';

interface EditResidentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resident: ResidentWithUnit | null;
  buildings: Building[];
  units: Unit[];
}

const EditResidentModal = ({
  open,
  onClose,
  onSuccess,
  resident,
  buildings,
  units,
}: EditResidentModalProps) => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '',
    unit_id: 0,
  });
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize form data when resident changes
  useEffect(() => {
    if (resident) {
      setFormData({
        name: resident.name,
        unit_id: resident.unit_id,
      });
      setSelectedBuildingId(resident.building_id);
    }
  }, [resident]);

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const resetInputsHandler = () => {
    setFormData({
      name: '',
      unit_id: 0,
    });
    setSelectedBuildingId(0);
    setErrorMessage('');
    setSuccessMessage('');
    onClose();
  };

  const updateResidentHandler = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!resident) {
      setErrorMessage('No resident selected.');
      return;
    }

    if (formData.name.trim() === '') {
      setErrorMessage('Please enter a resident name.');
      return;
    }

    if (!selectedBuildingId || selectedBuildingId === 0) {
      setErrorMessage('Please select a building.');
      return;
    }

    if (!formData.unit_id || formData.unit_id === 0) {
      setErrorMessage('Please select a unit.');
      return;
    }

    try {
      const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
      const response = await fetch(`${ENDPOINTS.RESIDENTS}/id/${resident.id}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error?.message || response.statusText;
        throw new Error(errorMessage);
      } else {
        setSuccessMessage('Resident updated successfully.');
        onSuccess();
        resetInputsHandler();
      }
    } catch (error) {
      console.error('Error updating resident:', error);
      setErrorMessage(`Failed to update resident: ${(error as Error).message}`);
    }
  };

  // Filter units based on selected building
  const filteredUnits = selectedBuildingId && selectedBuildingId !== 0
    ? units.filter(unit => unit.building_id === selectedBuildingId)
    : [];

  const handleBuildingChange = (buildingId: number) => {
    setSelectedBuildingId(buildingId);
    // Clear unit selection when building changes if the current unit doesn't belong to the new building
    if (buildingId && buildingId !== 0) {
      const currentUnit = units.find(u => u.id === formData.unit_id);
      if (currentUnit && currentUnit.building_id !== buildingId) {
        handleInputChange('unit_id', 0);
      }
    } else {
      handleInputChange('unit_id', 0);
    }
  };

  if (!resident) return null;

  return (
    <Modal open={open} onClose={resetInputsHandler}>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '30%',
          padding: 3,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Edit Resident
        </Typography>

        {/* Name Input */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight="bold">Name *</Typography>
          <TextField
            fullWidth
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter resident name"
          />
        </Box>

        {/* Building Dropdown */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="building-select-label">Building *</InputLabel>
            <Select
              labelId="building-select-label"
              value={selectedBuildingId}
              onChange={(e) => handleBuildingChange(e.target.value as number)}
              label="Building *"
            >
              <MenuItem value={0} disabled>
                <em>Select a building</em>
              </MenuItem>
              {buildings.map((building) => (
                <MenuItem key={building.id} value={building.id}>
                  {building.code} - {building.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Unit Dropdown */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth disabled={!selectedBuildingId || selectedBuildingId === 0}>
            <InputLabel id="unit-select-label">Unit *</InputLabel>
            <Select
              labelId="unit-select-label"
              value={formData.unit_id}
              onChange={(e) => handleInputChange('unit_id', e.target.value as number)}
              label="Unit *"
            >
              <MenuItem value={0} disabled>
                <em>Select a unit</em>
              </MenuItem>
              {filteredUnits.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  Unit {unit.unit_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Error/Success Message */}
        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        {successMessage && (
          <Typography color="primary" sx={{ mb: 2 }}>
            {successMessage}
          </Typography>
        )}

        {/* Buttons */}
        <Box
          id="modal-buttons"
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button onClick={resetInputsHandler} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={updateResidentHandler}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditResidentModal;
