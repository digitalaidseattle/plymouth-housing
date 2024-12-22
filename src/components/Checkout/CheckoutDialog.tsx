import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CheckoutItem } from '../../types/interfaces';
import CheckoutCard from './CheckoutCard';
import { ENDPOINTS, HEADERS } from '../../types/constants';
import { getRole, UserContext } from '../contexts/UserContext';

type CheckoutDialogProps = {
  open: boolean;
  onClose: () => void;
  checkoutItems: CheckoutItem[];
  removeItemFromCart: (itemId: number) => void;
  addItemToCart: (item: CheckoutItem, quantity: number) => void;
  setCheckoutItems: (items: CheckoutItem[]) => void;
  selectedBuildingCode: string;
  // renderItemQuantityButtons: (item: CheckoutItem) => JSX.Element;
};

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ open, onClose, checkoutItems, setCheckoutItems, removeItemFromCart, addItemToCart, selectedBuildingCode }) => {
  const {user} = useContext(UserContext);
  const [originalCheckoutItems, setOriginalCheckoutItems] = useState<CheckoutItem[]>([]);

  useEffect(() => {
    if (open) {
      setOriginalCheckoutItems([...checkoutItems]);
    }
  }, [open, checkoutItems]);


  const handleCancel = () => {
    setCheckoutItems(originalCheckoutItems);
    onClose();
  };

  const handleConfirm = async () => {
    try {
      HEADERS['X-MS-API-ROLE'] = getRole(user);
      const response = await fetch(ENDPOINTS.PROCESS_CHECKOUT, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
            user_id: 12,
            items: checkoutItems.map((item) => ({ id: item.id, quantity: item.quantity })),
          }),
      });

      console.log('json: ', response.json);
      if (!response.ok) {
        console.log(response.statusText);
        throw new Error('Failed to process transaction.');
      }

      const data = await response.json();
      const result = data.value[0]; // Get the GUID
      console.log('return: ', result);

      return result;
    } catch (error) {
      console.error('Failed to process transaction:', error);
      // setSnackbarMessage('Failed to verify PIN. Please try again.');
      // setSnackbarSeverity('warning');
      // setOpenSnackbar(true);
      return null;
    }
    onClose();
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          width: '50vw',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '10px'
        },
      }}
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <Box sx={{ width: '80%', paddingTop: '20px' }}>
        <DialogTitle sx={{ padding: '20px 0px 0px 0px' }} id="customized-dialog-title">
          <Typography style={{ fontSize: '1.5rem' }}>Checkout Summary</Typography>
        </DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '15px', marginBottom: '30px' }}>
          <Typography>Building code: {selectedBuildingCode}</Typography>
          <Typography>Total Items Checked Out: {checkoutItems.length}</Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
        <DialogContent dividers sx={{
          flex: 1, // Allows this area to expand
          overflowY: 'auto', // Enables vertical scrolling
          padding: '0 20px',
          maxHeight: '40vh', // Adjust maxHeight based on title/footer space
        }}>
          {checkoutItems.map((item: CheckoutItem) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', my: '10px' }}>
              <CheckoutCard item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={true} />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Return to Checkout Page</Button>
          <Button onClick={handleConfirm} autoFocus>Confirm</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CheckoutDialog;
