import { useContext, useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { ENDPOINTS, API_HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../../components/contexts/UserContext';
import { Building, Unit } from '../../types/interfaces';
import { getBuildings, getUnitNumbers } from '../../components/Checkout/CheckoutAPICalls';

interface AddResidentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddResidentModal = ({
  open,
  onClose,
  onSuccess,
}: AddResidentModalProps) => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '',
    unit_id: 0,
  });
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(0);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch buildings on mount
  useEffect(() => {
    const fetchBuildingsData = async () => {
      try {
        const buildingsData = await getBuildings(user);
        setBuildings(buildingsData);
      } catch (error) {
        console.error('Error fetching buildings:', error);
        setErrorMessage('Failed to load buildings.');
      }
    };

    if (open) {
      fetchBuildingsData();
    }
  }, [open, user]);

  // Fetch units when building changes
  useEffect(() => {
    const fetchUnitsData = async () => {
      if (selectedBuildingId && selectedBuildingId !== 0) {
        try {
          const unitsData = await getUnitNumbers(user, selectedBuildingId);
          setUnits(unitsData);
        } catch (error) {
          console.error('Error fetching units:', error);
          setErrorMessage('Failed to load units for selected building.');
        }
      } else {
        setUnits([]);
      }
    };

    fetchUnitsData();
  }, [selectedBuildingId, user]);

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

  const createResidentHandler = async () => {
    setErrorMessage('');
    setSuccessMessage('');

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
      const response = await fetch(ENDPOINTS.RESIDENTS, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error?.message || response.statusText;
        throw new Error(errorMessage);
      } else {
        setSuccessMessage('Resident added successfully.');
        onSuccess();
        resetInputsHandler();
      }
    } catch (error) {
      console.error('Error posting to database:', error);
      setErrorMessage(`Failed to add resident: ${(error as Error).message}`);
    }
  };

  const handleBuildingChange = (buildingId: number) => {
    setSelectedBuildingId(buildingId);
    // Clear unit selection when building changes
    handleInputChange('unit_id', 0);
  };

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
          Add Resident
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
              {units.map((unit) => (
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
            onClick={createResidentHandler}
            variant="contained"
            color="primary"
          >
            Add
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddResidentModal;
