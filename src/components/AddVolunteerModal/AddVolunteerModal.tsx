import { useContext, useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { AddVolunteerModalProps } from '../../types/interfaces';
import { ENDPOINTS, HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../contexts/UserContext';

const AddVolunteerModal = ({
  addModal,
  handleAddClose,
  fetchData,
}: AddVolunteerModalProps) => {
  const {user} = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    PIN: '',
    created_at: new Date().toISOString(),
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const resetInputsHandler = () => {
    setFormData({
      name: '',
      email: '',
      PIN: '',
      created_at: new Date().toISOString(),
    });
    setErrorMessage('');
    setSuccessMessage('');
    handleAddClose();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const createVolunteerHandler = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (
      formData.name === '' ||
      formData.email === '' ||
      formData.PIN.length !== 4
    ) {
      setErrorMessage('Please enter valid information. PIN must be 4 digits.');
      return;
    }
    if (!/^\d{4}$/.test(formData.PIN)) {
      setErrorMessage('PIN must contain exactly 4 numeric digits.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.VOLUNTEERS, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ ...formData, active: true }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error?.message || response.statusText;
        throw new Error(errorMessage);
      } else {
        setSuccessMessage('Volunteer added successfully.');
        fetchData();
        resetInputsHandler();
      }
    } catch (error) {
      console.error('Error posting to database:', error);
      setErrorMessage(`Failed to add volunteer: ${(error as Error).message}`);
    }
  };

  return (
    <Modal open={addModal} onClose={resetInputsHandler}>
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
          Add Volunteer
        </Typography>

        {/* Name Input */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight="bold">Name</Typography>
          <TextField
            fullWidth
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter name"
          />
        </Box>

        {/* Email Input */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight="bold">Email</Typography>
          <TextField
            fullWidth
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            type="email"
            placeholder="Enter email"
          />
        </Box>

        {/* PIN Input */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight="bold">PIN (4 digits)</Typography>
          <TextField
            fullWidth
            value={formData.PIN}
            onChange={(e) => handleInputChange('PIN', e.target.value)}
            type="text"
            placeholder="Enter 4-digit PIN"
            inputProps={{ maxLength: 4, pattern: '\\d{4}' }}
          />
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
            onClick={createVolunteerHandler}
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

export default AddVolunteerModal;
