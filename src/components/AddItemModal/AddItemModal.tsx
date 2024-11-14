/* eslint-disable @typescript-eslint/no-unused-vars */
import { Modal, Box, Typography, Select, MenuItem, TextField, Button, Autocomplete, AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material';
import React, { useEffect, useState } from 'react';

type InventoryItem = {
  id: number;
  name: string;
  type: string;
  quantity: number;
  category: string;
  description: string;
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

  const [updateId, setUpdateId] = useState<number>();
  const [updateItem, setUpdateItem] = useState<InventoryItem | string>();
  const [addName, setAddName] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addType, setAddType] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addQuantity, setAddQuantity] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [nameSearch, setNameSearch] = useState<InventoryItem[]>([]);

  const handleAddType = (event: { target: { value: string } }) => {
    setAddType(event.target.value)
  }

  const handleAddCategory = (event: { target: { value: string } }) => {
    setAddCategory(event.target.value)
  }

  const handleAddQuantity = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddQuantity(Number(event.target.value));
  };

  const handleAddDescription = (event: { target: { value: string } }) => {
    setAddDescription(event.target.value)
  }

  const onChangeHandler = (
    _event: React.SyntheticEvent | React.FocusEvent<HTMLElement>,
    value?: InventoryItem | string | null,
    _reason?: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<InventoryItem>
  ) => {
    console.log(typeof (value));
    if (value && typeof (value) === 'object') { //If name already exists, type will be an object
      setUpdateId(value.id);
      setAddName(value.name)
      setAddDescription(value.description)
      setAddType(value.type)
      setAddCategory(value.category)
      setAddQuantity(value.quantity)
      setUpdateItem(value);
    } else if (typeof (value) === 'string') {
      console.log('handleUpdate', value);
      setAddName(value);
      setUpdateItem(value);
    }
  };

  const resetInputsHandler = () => {
    setAddType('');
    setAddName('');
    setAddCategory('');
    setAddQuantity(0);
    setAddDescription('');
    handleAddClose();
  }

  const inputChangeHandler = (_event: React.SyntheticEvent, value: string) => {
    // This function allows the dropdown menu to appear blank when initially clicking on the textbox. When a user types, it then updates the nameSearch options. nameSearch is then fed in as the possible options in the dropdown options
    if (value) {
      const filteredItems = originalData.filter(
        (item) =>
          item.name.toLowerCase().includes(value.toLowerCase()) || item.description.toLowerCase().includes(value.toLowerCase())
      );
      setNameSearch(filteredItems);
    } else {
      setNameSearch([])
    }
    setAddName(value);
    setUpdateItem(value);
    console.log('inputChangeHandler:', value)
  }

  const createItemHandler = async () => {
    if (addType === '' || addName === '' || addCategory === '' || addQuantity === 0 || addDescription === '') {
      setErrorMessage('Missing Information')
    } else {
      try {
        const response = await fetch(API, { method: "POST", headers: HEADERS, body: JSON.stringify({ name: addName, type: addType, category: addCategory, quantity: addQuantity, description: addDescription }) });
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
        console.error('Error posting to database:', error);
        setErrorMessage(`${error}`)
      }
    }
  }

  const updateItemHandler = async () => {
    console.log(updateId);
    if (addType === '' || addName === '' || addCategory === '' || addDescription === '') {
      setErrorMessage('Missing Information')
    } else {
      try {
        const response = await fetch(`${API}/id/${updateId}`, { method: "PATCH", headers: HEADERS, body: JSON.stringify({ type: addType, category: addCategory, quantity: addQuantity, description: addDescription }) });
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
        setErrorMessage(`Error updating to database: ${error.message}`)
        setErrorMessage(`${error}`)
      }
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
            Add/Update Item
          </Typography>

          {/* Item Name */}
          <Box id="add-item-name" sx={{ width: '100%' }}>
            <Typography fontWeight='bold'>
              Name (Click the item from the dropdown if you want to update!)
            </Typography>
            <Autocomplete
              freeSolo
              onInputChange={inputChangeHandler}
              onChange={onChangeHandler}
              onBlur={(event) => onChangeHandler(event, updateItem)}
              options={nameSearch} // Pass the full array of objects
              getOptionLabel={(option) => {
                // Display the name property in the dropdown
                return typeof option === 'string' ? option : option.name || '';
              }}
              filterOptions={(options, { inputValue }) => { //This filter function details the rules for how the autocomplete should filter the dropdown options
                return options.filter((option) =>
                  option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                  option.description.toLowerCase().includes(inputValue.toLowerCase())
                );
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>

          {/* Description */}
          <Box id="add-item-description" sx={{ width: '100%' }}>
            <Typography fontWeight='bold'>
              Description
            </Typography>
            <TextField sx={{ width: '100%' }} value={addDescription} onChange={handleAddDescription}></TextField>
          </Box>

          {/* Item Type */}
          <Box id="add-item-type" sx={{ width: '100%' }}>
            <Typography fontWeight='bold'>
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
            <Typography fontWeight='bold'>
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
            <Typography fontWeight='bold'>
              Quantity
            </Typography>
            <TextField sx={{ width: '100%' }} value={addQuantity} type="number" onChange={handleAddQuantity}></TextField>
          </Box>
          {errorMessage.length > 0 ? <Typography color='red'>{errorMessage}</Typography> : null}
          <Box id="modal-buttons" sx={{ display: 'flex', width: '100%', justifyContent: 'end' }}>
            <Button sx={{ mr: '20px', color: 'black' }} onClick={resetInputsHandler}>Cancel</Button>
            {typeof (updateItem) === 'object' ? <Button sx={{ color: 'black' }} onClick={updateItemHandler}>Update</Button> : <Button sx={{ color: 'black' }} onClick={createItemHandler}>Create</Button>}
          </Box>
        </Box>
      </Box>
    </Modal>
  )

}


export default AddItemModal;