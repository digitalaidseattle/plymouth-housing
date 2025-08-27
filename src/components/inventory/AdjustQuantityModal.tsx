import { Box, Typography, TextField, Button, styled } from '@mui/material';
import { useContext, useState } from 'react';
import { InventoryItem } from '../../types/interfaces.ts';
import SnackbarAlert from '../SnackbarAlert.tsx';
import { ENDPOINTS, API_HEADERS } from '../../types/constants.ts';
import { getRole, UserContext } from '../contexts/UserContext.ts';
import DialogTemplate from '../Checkout/DialogTemplate.tsx';

type FormData = {
  type: string;
  name: string;
  quantity: number;
};

type AdjustQuantityModalProps = {
  showDialog: boolean;
  handleClose: () => void;
  fetchData: () => void;
  itemToEdit: InventoryItem | null;
}

const AdjustQuantityModal = ({ showDialog, handleClose, fetchData, itemToEdit }: AdjustQuantityModalProps) => {
  const { user, loggedInUserId } = useContext(UserContext);
  const [formData, setFormData] = useState<FormData>({
    type: '',
    name: '',
    quantity: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');

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
  }

  const resetInputsHandler = () => {
    handleClose();
    setFormData({
      name: '',
      type: '',
      quantity: 0
    })
    setErrorMessage('');
  }

  const updateItemHandler = async () => {
    if (formData.type === '' || formData.name === '' || formData.quantity === 0 || !itemToEdit) {
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
            item: [{ id: itemToEdit.id, quantity: formData.quantity }],
          }) 
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        } else {
          setErrorMessage('');
          fetchData();
        }
      }
      catch (error) {
        console.error('Error updating to database:', error);
        setErrorMessage(`${error}`)
      }
    }
  }

  const QuantityForm = () => 
    <>
    <DialogTitle>
      Adjust {itemToEdit?.name} number
    </DialogTitle>

    <Box id="current-stock" sx={{ width: '100%' }}>
      <Typography fontWeight='bold'>
        Current stock: {itemToEdit?.quantity}
      </Typography>
    </Box>

    <Box id="add-item-quantity">
        <Typography fontWeight='bold'>
          New Quantity
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <TextField 
            sx={{ textAlign: 'center', width: '5rem' }} 
            value={formData.quantity} 
            type="number" 
            onChange={(e) => handleInputChange('quantity', e.target.value)}></TextField>
        </Box>
    </Box>

    <Box id="modal-buttons" sx={{ display: 'flex', width: '100%', justifyContent: 'end' }}>
      <Button sx={{ mr: '20px', color: 'black' }} onClick={resetInputsHandler}>Cancel</Button>
      <Button sx={{ color: 'black' }} onClick={updateItemHandler}>Submit</Button>
    </Box>

    {errorMessage.length > 0 ? <SnackbarAlert open={true} onClose={() => setErrorMessage('')}  severity={'error'}> {errorMessage} </SnackbarAlert> : null}
    </>

  return (
    <DialogTemplate
      showDialog={showDialog}
      handleShowDialog={resetInputsHandler}
      handleSubmit={()=>{}}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '1rem', width: '100%', margin: 'auto', height: '100%' }}>
          <QuantityForm />
        </Box>
    </DialogTemplate>

    
  )

}

export default AdjustQuantityModal;