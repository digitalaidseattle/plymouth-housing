import { Modal, Box, Typography, Select, MenuItem, TextField, Button, Autocomplete } from '@mui/material';
import React, { useEffect, useState } from 'react';

type InventoryItem = {
  id: number;
  name: string;
  type: string;
  quantity: number;
  category: string;
  definition: string;
  status: string;
};

type AddItemModalProps = {
  addModal: boolean;
  handleAddClose: () => void;
  fetchData: () => void;
  uniqueCategories: string[];
  originalData: InventoryItem[];
}

const API = "/data-api/rest/item";
const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8', }; //The server is denying me access to post. In the swa config file, if I add 'create' to the anonymous role, it will grant access. Needs to be updated later.

const AddItemModal = ({ addModal, handleAddClose, fetchData, uniqueCategories, originalData }: AddItemModalProps) => {

  const [addName, setAddName] = useState('');
  const [addType, setAddType] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [errorMessage, setErrorMessage] = useState(false);
  const [nameSearch, setNameSearch] = useState<InventoryItem[]>([]);

  const handleAddType = (event: { target: { value: string } }) => {
    setAddType(event.target.value)
  }

  // const handleAddName = (event: { target: { value: string } }) => {
  //   setAddName(event.target.value)
  // }

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

  const inputChangeHandler = (event: React.SyntheticEvent, value: string) => {
    // console.log('Original Data:', originalData)
    // console.log('Value:', value)
    // This function allows the dropdown menu to appear blank when initially clicking on the textbox. When a user types, it then updates the nameSearch options. nameSearch is then fed in as the possible options in the dropdown options
    if (value) {
      const filteredItems = originalData.filter(
        (item) =>
          item.name.toLowerCase().includes(value.toLowerCase()) || item.definition.toLowerCase().includes(value.toLowerCase())
      );
      setNameSearch(filteredItems);
    } else {
      setNameSearch([])
    }
    setAddName(value);
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
      }
      catch (error) {
        console.error('Error posting to database:', error)
      }
      fetchData();
      handleAddClose();
      resetInputsHandler();
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

          {/* Item Name */}
          <Box id="add-item-name" sx={{ width: '100%' }}>
            <Typography>
              Name
            </Typography>
            <Autocomplete
              freeSolo
              onInputChange={inputChangeHandler}
              options={nameSearch} // Pass the full array of objects
              getOptionLabel={(option) => {
                // Display the name property in the dropdown
                return typeof option === 'string' ? option : option.name || '';
              }}
              filterOptions={(options, { inputValue }) => { //This filter function details the rules for how the autocomplete should filter the dropdown options.
                return options.filter((option) =>
                  option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                  option.definition.toLowerCase().includes(inputValue.toLowerCase())
                );
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            {/* <TextField sx={{ width: '100%' }} onChange={handleAddName}></TextField> */}
          </Box>

          {/* Item Type */}
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

          {/* Item Category */}
          <Box id="add-item-category" sx={{ width: '100%' }}>
            <Typography>
              Category
            </Typography>
            <Select
              value={addCategory}
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