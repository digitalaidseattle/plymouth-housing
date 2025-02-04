import { Modal, Box, Typography, Select, MenuItem, TextField, Button, Autocomplete, } from '@mui/material';
import { useContext, useState } from 'react';
import { InventoryItem } from '../../types/interfaces.ts';
import { DASSnackbar } from '../DASSnackbar.tsx';
import { ENDPOINTS, HEADERS } from '../../types/constants.ts';
import { getRole, UserContext } from '../contexts/UserContext.ts';

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
}

const AddItemModal = ({ addModal, handleAddClose, fetchData, originalData }: AddItemModalProps) => {
  const { user } = useContext(UserContext);
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    type: '',
    name: '',
    quantity: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [nameSearch, setNameSearch] = useState<InventoryItem[]>([]);

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
    handleAddClose();
  }

  const updateItemHandler = async () => {
    if (formData.type === '' || formData.name === '' || formData.quantity === 0 || !updateItem) {
      setErrorMessage('Missing Information or Quantity cannot be 0')
      return;
    } else if (Number(updateItem.quantity) + Number(formData.quantity) < 0) {
      setErrorMessage('Item quantity cannot go below 0.')
      return;
    } else {
      try {
        HEADERS['X-MS-API-ROLE'] = getRole(user);
        const response = await fetch(`${ENDPOINTS.ITEMS}/id/${updateItem.id}`, { method: "PATCH", headers: HEADERS, body: JSON.stringify({ quantity: Number(updateItem.quantity) + Number(formData.quantity) }) });
        if (!response.ok) {
          throw new Error(response.statusText);
        } else {
          setErrorMessage('');
          fetchData();
          handleAddClose();
          resetInputsHandler();
        }
      }
      catch (error) {
        console.error('Error updating to database:', error);
        setErrorMessage(`${error}`)
      }
    }
  }

  return (
    <Modal
      open={addModal}
      onClose={resetInputsHandler}
    >
      {/* Title Section */}
      <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '500px', width: '30%', height: '400px', minHeight: '30%', backgroundColor: 'white', borderRadius: '8px', overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'space-evenly', width: '70%', margin: 'auto', height: '100%' }}>
          <Typography sx={{ fontSize: '20px', }}>
            Add Item
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

          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
            {/* Item Name */}
            <Box id="add-item-name" sx={{ width: '65%' }}>
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
                    option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                    option.description.toLowerCase().includes(inputValue.toLowerCase())
                  );
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Box>

            <Box id="add-item-quantity" sx={{ width: '30%' }}>
              <Typography fontWeight='bold'>
                Quantity
              </Typography>
              <TextField sx={{ width: '100%' }} value={formData.quantity} type="number" onChange={(e) => handleInputChange('quantity', e.target.value)}></TextField>
            </Box>
          </Box>
          {errorMessage.length > 0 ? <DASSnackbar open={true} severity='error' message={errorMessage} onClose={() => setErrorMessage('')} /> : null}
          <Box id="modal-buttons" sx={{ display: 'flex', width: '100%', justifyContent: 'end' }}>
            <Button sx={{ mr: '20px', color: 'black' }} onClick={resetInputsHandler}>Cancel</Button>
            <Button sx={{ color: 'black' }} onClick={updateItemHandler}>Add</Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )

}

export default AddItemModal;