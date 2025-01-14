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
import { CategoryProps, CheckoutItem } from '../../types/interfaces';
import CheckoutCard from './CheckoutCard';
import { UserContext } from '../contexts/UserContext';
import { processGeneralItems, processWelcomeBasket } from './CheckoutAPICalls';

type CheckoutDialogProps = {
  open: boolean;
  onClose: () => void;
  checkoutItems: CheckoutItem[];
  welcomeBasketData: CategoryProps[];
  removeItemFromCart: (itemId: number) => void;
  addItemToCart: (item: CheckoutItem, quantity: number) => void;
  setCheckoutItems: (items: CheckoutItem[]) => void;
  selectedBuildingCode: string;
};

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ open, onClose, checkoutItems, welcomeBasketData, setCheckoutItems, removeItemFromCart, addItemToCart, selectedBuildingCode }) => {
  const { user, loggedInVolunteer, loggedInAdmin } = useContext(UserContext);
  const [originalCheckoutItems, setOriginalCheckoutItems] = useState<CheckoutItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (open) {
      setOriginalCheckoutItems([...checkoutItems]);
      setStatusMessage('')
    }
  }, [open, checkoutItems]);

  const handleCancel = () => {
    setCheckoutItems(originalCheckoutItems);
    setStatusMessage('')
    onClose();
  };

  const handleConfirm = async () => {
    try {
      // 1. Decide who the "actor" is (volunteer or admin).
      let currentUserId = null;
      if (loggedInVolunteer?.id) {
        currentUserId = loggedInVolunteer.id;
      } else if (loggedInAdmin?.id) {
        currentUserId = loggedInAdmin.id;
      } else {
        throw new Error('No valid user (volunteer or admin) found. Cannot checkout.');
      }

      const welcomeBasketItemIds = welcomeBasketData.flatMap(basket => basket.items.map(item => item.id));
      const isWelcomeBasket = checkoutItems.some(item => welcomeBasketItemIds.includes(item.id));
      let data = null;
      if (isWelcomeBasket) {
        // pass "currentUserId" to the processWelcomeBasket function
        data = await processWelcomeBasket(user, currentUserId, checkoutItems);
      } else {
        data = await processGeneralItems(user, currentUserId, checkoutItems);
      }

      const result = data.value[0];
      if (result.Status !== 'Success') {
        throw new Error(result.message);
      }
      setCheckoutItems([]);
      setStatusMessage('Transaction Successful');

      return null;
    } catch (error) {
      console.error('Transaction failed:', error);
      setStatusMessage('Transaction failed: ' + error);
      return null;
    }
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
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px',
          textAlign: 'center',
        }}>
          <Typography>{statusMessage}</Typography>
        </Box>
      </Box>
    </Dialog>
  );
};
