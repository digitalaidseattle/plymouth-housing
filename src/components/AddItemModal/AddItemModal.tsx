import { Modal, Box, Typography, Select, MenuItem, TextField, Button } from '@mui/material';
import { useState } from 'react';

type AddItemModalProps = {
  addModal: boolean;
  handleAddClose: () => void;
  fetchData: () => void;
  uniqueCategories: string[];
}

const API = "/data-api/rest/item";
const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8', 'x-ms-client-principal-role': 'admin' }; //The server is denying me access to post, have to add the admin role to HEADERS. In the swa config file, if I add 'create' to the anonymous role, it will grant access

const AddItemModal = ({ addModal, handleAddClose, fetchData, uniqueCategories }: AddItemModalProps) => {

  const [addType, setAddType] = useState('');
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [errorMessage, setErrorMessage] = useState(false);

  const handleAddType = (event: { target: { value: string } }) => {
    setAddType(event.target.value)
  }

  const handleAddName = (event: { target: { value: string } }) => {
    setAddName(event.target.value)
  }

  const handleAddCategory = (event: { target: { value: string } }) => {
    setAddCategory(event.target.value)
  }

  const handleAddQuantity = (event: { target: { value: string } }) => {
    setAddQuantity(event.target.value)
  }

  const resetInputsHandler = () => {
    setAddType('');
    setAddName('');
    setAddCategory('');
    setAddQuantity('');
    handleAddClose();
  }

  const createItemHandler = async () => {
    if (addType === '' || addName === '' || addCategory === '' || addQuantity === '') {
      setErrorMessage(true)
    } else {
      try {
        setErrorMessage(false);
        const response = await fetch(API, { method: "POST", headers: HEADERS, body: JSON.stringify({ name: addName, type: addType, category: addCategory, quantity: addQuantity }) });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const result = await response.json();
        console.log(result.value);
      }
      catch (error) {
        console.error('Error posting to database:', error)
      }
      fetchData();
    }
  }

  return (
    <Modal
      open={addModal}
      onClose={resetInputsHandler}
    >
      <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40%', height: '60%', backgroundColor: 'white', borderRadius: '8px', overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'space-evenly', width: '70%', margin: 'auto', height: '100%' }}>
          <Typography sx={{ fontSize: '20px', }}>
            Add Item
          </Typography>
          <Box id="add-item-type" sx={{ width: '100%' }}>
            <Typography>
              Type
            </Typography>
            <Select
              value={addType}
              onChange={handleAddType}
              sx={{ width: '100%' }}
            >
              <MenuItem value={'Donation'}>Donation</MenuItem>
              <MenuItem value={'Welcome Basket'}>Welcome Basket</MenuItem>
            </Select>
          </Box>
          <Box id="add-item-name" sx={{ width: '100%' }}>
            <Typography>
              Item
            </Typography>
            <TextField sx={{ width: '100%' }} onChange={handleAddName}></TextField>
          </Box>
          <Box id="add-item-category" sx={{ width: '100%' }}>
            <Typography>
              Category
            </Typography>
            <Select
              value={addType}
              onChange={handleAddCategory}
              sx={{ width: '100%' }}
            >
              {uniqueCategories.map((category: string) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box id="add-item-quantity" sx={{ width: '100%' }}>
            <Typography>
              Quantity
            </Typography>
            <TextField sx={{ width: '100%' }} onChange={handleAddQuantity}></TextField>
          </Box>
          {errorMessage ? <Typography color='red'>Missing Information!</Typography> : null}
          <Box id="modal-buttons" sx={{ display: 'flex', width: '100%', justifyContent: 'end' }}>
            <Button sx={{ mr: '20px', color: 'black' }} onClick={resetInputsHandler}>Cancel</Button>
            <Button sx={{ color: 'black' }} onClick={createItemHandler}>Create</Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )

}


export default AddItemModal;