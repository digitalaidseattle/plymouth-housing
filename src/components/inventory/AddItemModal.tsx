import { Box, Typography, Select, MenuItem, TextField, Button, Autocomplete, IconButton, useTheme, styled, Alert } from '@mui/material';
import { useContext, useState } from 'react';
import { InventoryItem } from '../../types/interfaces.ts';
import SnackbarAlert from '../SnackbarAlert.tsx';
import { ENDPOINTS, API_HEADERS } from '../../types/constants.ts';
import { getRole, UserContext } from '../contexts/UserContext.ts';
import { Add, Remove } from '@mui/icons-material';
import DialogTemplate from '../DialogTemplate.tsx';

type FormData = {
  type: string;
  name: string;
  quantity: number;
};

type AddItemModalProps = {
  addModal: boolean;
  handleAddClose: () => void;
  fetchData: () => void;
  originalData: InventoryItem[];
  showResults: boolean;
  setShowResults: (b: boolean) => void;
}

const AddItemModal = ({ addModal, handleAddClose, fetchData, originalData, showResults, setShowResults }: AddItemModalProps) => {
  const { user, loggedInUserId } = useContext(UserContext);
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    type: '',
    name: '',
    quantity: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [nameSearch, setNameSearch] = useState<InventoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newTotalQuantity = Number(updateItem?.quantity) + Number(formData.quantity);

  const theme = useTheme();

  const ResultText = styled('span')({
    marginLeft: '0.25rem',
    color: theme.palette.success.dark
  });

  const DialogTitle = styled('h1')({
    fontSize: '1.25rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    margin: '0'
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }))
    if (field === 'type' && typeof value === 'string') {
      const filteredItems = originalData.filter(
        (item) =>
          item.type.toLowerCase().includes(value.toLowerCase())
      );
      setNameSearch(filteredItems);
    }
  }

  const onChangeHandler = (selected: InventoryItem | null) => {
    if (selected) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        name: selected.name,
      }));
      setUpdateItem(selected);
    } else {
      setUpdateItem(null);
    }
  };

  const resetInputsHandler = () => {
    handleAddClose();
    setFormData({
      name: '',
      type: '',
      quantity: 0
    })
    setUpdateItem(null);
    setErrorMessage('');
    setIsSubmitting(false);
  }

  const updateItemHandler = async () => {
    if (formData.type === '' || formData.name === '' || formData.quantity === 0 || !updateItem) {
      setErrorMessage('Missing Information or Quantity cannot be 0')
      return;
    }
    // regex test to check for only whole numbers, including negatives
    const rx = new RegExp(/^-?\d+$/);
    if (!rx.test(formData.quantity.toString())) {
      setErrorMessage('The quantity must be a non-decimal number.');
      return false;
    }
    const qty = typeof formData.quantity === 'string'
      ? Number(formData.quantity)
      : formData.quantity;
    setIsSubmitting(true);
    document.body.style.cursor = 'wait';
    try {
      const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
      const response = await fetch(ENDPOINTS.PROCESS_INVENTORY_CHANGE, {
        method: "POST",
        headers,
        body: JSON.stringify({
          user_id: loggedInUserId,
          item: [{ id: updateItem.id, quantity: qty }],
        })
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      fetchData();
      setShowResults(true);
    }
    catch (error) {
      console.error('Error updating the database:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setErrorMessage('Your system appears to be offline. Please check your connection and try again.');
      } else {
        setErrorMessage(`${error}`);
      }
    } finally {
      setIsSubmitting(false);
      document.body.style.cursor = 'default';
    }
  }

  const QuantityForm = () =>
    <>
      <DialogTitle>
        Edit Item Quantity
      </DialogTitle>

      {/* Item Type */}
      <Box id="add-item-type" sx={{ width: '100%' }}>
        <Typography fontWeight='bold'>
          Inventory Type
        </Typography>
        <Select
          value={formData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          sx={{ width: '100%' }}
        >
          <MenuItem value={'General'}>General</MenuItem>
          <MenuItem value={'Welcome Basket'}>Welcome Basket</MenuItem>
        </Select>
      </Box>

      {/* Item Name */}
      <Box id="add-item-name" sx={{ width: '100%' }}>
        <Typography fontWeight='bold'>
          Item Name
        </Typography>
        <Autocomplete
          onChange={(_, value) => onChangeHandler(value)}
          value={updateItem}
          options={nameSearch} // Pass the full array of objects
          getOptionLabel={(option) => option.name}
          renderOption={(props, option) => (
            <li {...props} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span>
                {option.name}
              </span>
              {option.category && (
                <span style={{ fontSize: '0.8rem', color: 'gray' }}>
                  {option.category}
                </span>
              )}
            </li>
          )}
          filterOptions={(options, { inputValue }) => { //This filter function details the rules for how the autocomplete should filter the dropdown options
            return options.filter((option) =>
              option.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
              option.description?.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          renderInput={(params) => <TextField {...params} />}
        />
      </Box>

      <Box id="add-item-quantity">
        <Typography fontWeight='bold'>
          Quantity
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <IconButton
            sx={{
              backgroundColor: '#E8E8E8', width: { xs: '40px', lg: '30px' },
              height: { xs: '40px', lg: '30px' }
            }}
            onClick={() => handleInputChange('quantity', Number(formData.quantity) - 1)}
          >
            <Remove sx={{ fontSize: { xs: 'extra-large', lg: 'large' } }} />
          </IconButton>
          <TextField 
            sx={{ textAlign: 'center', width: '5rem' }} 
            value={formData.quantity} 
            type="number" 
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            name="quantity"
          />
          <IconButton
            sx={{
              backgroundColor: '#E8E8E8', width: { xs: '40px', lg: '30px' },
              height: { xs: '40px', lg: '30px' }
            }}
            onClick={() => handleInputChange('quantity', Number(formData.quantity) + 1)}
          >
            <Add sx={{ fontSize: { xs: 'extra-large', lg: 'large' } }} />
          </IconButton>
        </Box>
      </Box>

      <Box id="modal-buttons" sx={{ display: 'flex', width: '100%', justifyContent: 'end' }}>
        <Button sx={{ mr: '20px', color: 'black' }} onClick={resetInputsHandler}>Cancel</Button>
        <Button sx={{ color: 'black' }} onClick={updateItemHandler} disabled={isSubmitting}>Submit</Button>
      </Box>

      {errorMessage.length > 0 ? <SnackbarAlert open={true} onClose={() => setErrorMessage('')} severity={'error'}> {errorMessage} </SnackbarAlert> : null}
    </>

  const ResultsContent = () =>
    <>
      <DialogTitle>
        Inventory Updated: {updateItem?.name}
      </DialogTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Box>Previous Stock: <ResultText>{updateItem?.quantity}</ResultText></Box>
        <Box>Quantity Added: <ResultText>{formData.quantity}</ResultText></Box>
        <Box>New Stock Total: <ResultText>{newTotalQuantity}</ResultText></Box>
      </Box>
      {newTotalQuantity < 0 &&
        <Alert severity="warning">Warning: Stock is negative. This item may have been over-issued. Please review and update it when possible.</Alert>}
    </>

  return (
    <DialogTemplate
      showDialog={addModal}
      handleShowDialog={resetInputsHandler}
    >
      {/* Title Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '1rem', width: '100%', margin: 'auto', height: '100%' }}>
        {showResults ? ResultsContent() : QuantityForm()}
      </Box>
    </DialogTemplate>
  )
}

export default AddItemModal;