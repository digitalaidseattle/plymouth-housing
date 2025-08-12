import { Modal, Box, Typography, Select, MenuItem, TextField, Button, Autocomplete, IconButton } from '@mui/material';
import { useContext, useState } from 'react';
import { InventoryItem } from '../../types/interfaces.ts';
import SnackbarAlert from '../SnackbarAlert.tsx';
import { ENDPOINTS, API_HEADERS } from '../../types/constants.ts';
import { getRole, UserContext } from '../contexts/UserContext.ts';
import { Add, Remove } from '@mui/icons-material';
import ResultsContent from './ResultsContent.tsx';
import DialogTemplate from '../DialogTemplate.tsx';

type FormData = {
  type: string;
  name: string;
  quantity: number;
};

type AddItemModalProps = {
  addModal: boolean;
  handleAddClose: () => void;
  handleSnackbar: (message: string, severity: 'warning' | 'success') => void;
  fetchData: () => void;
  originalData: InventoryItem[];
}

const AddItemModal = ({ addModal, handleAddClose, handleSnackbar, fetchData, originalData }: AddItemModalProps) => {
  const { user, loggedInUserId } = useContext(UserContext);
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    type: '',
    name: '',
    quantity: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [nameSearch, setNameSearch] = useState<InventoryItem[]>([]);
  const [showResults, setShowResults] = useState(false);

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
    setFormData({
      name: '',
      type: '',
      quantity: 0
    })
    setUpdateItem(null);
    setErrorMessage('');
    setShowResults(false);
    handleAddClose();
  }

  const updateItemHandler = async () => {
    const newQuantity = Number(updateItem?.quantity) + Number(formData.quantity);
    if (formData.type === '' || formData.name === '' || formData.quantity === 0 || !updateItem) {
      setErrorMessage('Missing Information or Quantity cannot be 0')
      return;
    } else {
      try {
        API_HEADERS['X-MS-API-ROLE'] = getRole(user);
        const response = await fetch(ENDPOINTS.PROCESS_INVENTORY_CHANGE, { 
          method: "POST", 
          headers: API_HEADERS, 
          body: JSON.stringify({ 
            user_id: loggedInUserId,
            item: [{ id: updateItem.id, quantity: formData.quantity }],
          }) 
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        } else {
          setErrorMessage('');
          fetchData();
          setShowResults(true);
          // todo: handle closing and reset inputs upon cancelling form, and window is closed
        }
      }
      catch (error) {
        console.error('Error updating to database:', error);
        setErrorMessage(`${error}`)
      }
    }
  }

  return (
    <DialogTemplate
      showDialog={addModal}
      handleShowDialog={resetInputsHandler}
      >
      {/* Title Section */}
      <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '500px', width: '30%', minHeight: '30vh', backgroundColor: 'white', borderRadius: '8px', overflow: 'auto', paddingY: '1.5rem' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '1rem', width: '70%', margin: 'auto', height: '100%' }}>
        {showResults && <>
          <Typography sx={{ fontSize: '20px', }}>
              Inventory Updated: {updateItem?.name}
          </Typography>
          <Box>
              <Typography>Previous Stock: {updateItem?.quantity}</Typography>
              <Typography>Quantity Added: {formData.quantity}</Typography>
              <Typography>New Stock Total: {Number(updateItem?.quantity) + Number(formData.quantity)}</Typography>
          </Box>
          </>
        }
        {!showResults && <>
          <Typography sx={{ fontSize: '20px', }}>
            Edit Item Quantity
          </Typography>

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
                  <Remove sx={{ fontSize: {xs: 'extra-large', lg: 'large' }}}/>
                </IconButton>
                <TextField inputProps={{style: { textAlign: 'center', width: '5rem' }}} value={formData.quantity} type="number" onChange={(e) => handleInputChange('quantity', e.target.value)}></TextField>
                <IconButton
                  sx={{
                    backgroundColor: '#E8E8E8', width: { xs: '40px', lg: '30px' },
                    height: { xs: '40px', lg: '30px' }
                  }}
                    onClick={() => handleInputChange('quantity', Number(formData.quantity) + 1)}
                >
                  <Add sx={{ fontSize: {xs: 'extra-large', lg: 'large' }}}/>
                </IconButton>
              </Box>
          </Box>

          {errorMessage.length > 0 ? <SnackbarAlert open={true} onClose={() => setErrorMessage('')}  severity={'error'}> {errorMessage} </SnackbarAlert> : null}
          <Box id="modal-buttons" sx={{ display: 'flex', width: '100%', justifyContent: 'end' }}>
            <Button sx={{ mr: '20px', color: 'black' }} onClick={resetInputsHandler}>Cancel</Button>
            <Button sx={{ color: 'black' }} onClick={updateItemHandler}>Submit</Button>
          </Box>
        </>}
        </Box>
      </Box>
    </DialogTemplate>

    
  )

}

export default AddItemModal;