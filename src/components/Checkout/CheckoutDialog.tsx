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
import { CategoryProps, CheckoutItemProp } from '../../types/interfaces';
import CheckoutCard from './CheckoutCard';
import { UserContext } from '../contexts/UserContext';
import { processGeneralItems, processWelcomeBasket } from './CheckoutAPICalls';

type CheckoutDialogProps = {
  open: boolean;
  onClose: () => void;
  checkoutItems: CategoryProps[];
  welcomeBasketData: CategoryProps[];
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  addItemToCart: (item: CheckoutItemProp, quantity: number, category: string, active: string) => void;
  setCheckoutItems: (items: CategoryProps[]) => void;
  selectedBuildingCode: string;
  setActiveSection: (s: string) => void;
  fetchData: () => void;
};

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ open, onClose, checkoutItems, welcomeBasketData, setCheckoutItems, removeItemFromCart, addItemToCart, selectedBuildingCode, setActiveSection, fetchData }) => {
  const { user, loggedInVolunteerId, loggedInAdminId } = useContext(UserContext);
  const [originalCheckoutItems, setOriginalCheckoutItems] = useState<CategoryProps[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [allItems, setAllItems] = useState<CheckoutItemProp[]>([]);

  useEffect(() => {
    if (open) {
      setOriginalCheckoutItems([...checkoutItems]);
      setStatusMessage('')
      setAllItems(checkoutItems.flatMap((item) => item.items));
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
      if (loggedInVolunteerId) {
        currentUserId = loggedInVolunteerId;
      } else if (loggedInAdminId) {
        currentUserId = loggedInAdminId;
      } else {
        throw new Error('No valid user (volunteer or admin) found. Cannot checkout.');
      }

      const welcomeBasketItemIds = welcomeBasketData.flatMap(basket => basket.items.map(item => item.id));
      const isWelcomeBasket = allItems.some(item => welcomeBasketItemIds.includes(item.id));
      let data = null;
      if (isWelcomeBasket) {
        // pass "currentUserId" to the processWelcomeBasket function
        data = await processWelcomeBasket(user, currentUserId, allItems);
      } else {
        data = await processGeneralItems(user, currentUserId, allItems);
      }

      const result = data.value[0];
      if (result.Status !== 'Success') {
        throw new Error(result.message);
      }
      setActiveSection('');
      fetchData();
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
          <Typography>Total Items Checked Out: {allItems.reduce((acc, item) => acc + item.quantity, 0)}</Typography>
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
          flex: 1,
          overflowY: 'auto',
          padding: '0 20px',
          maxHeight: '40vh',
        }}>
          {checkoutItems.map((section: CategoryProps) => {
            return section.items.map((item: CheckoutItemProp) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', my: '10px' }}>
                <CheckoutCard
                  key={item.id}
                  item={item}
                  categoryCheckout={section}
                  addItemToCart={(item, quantity) => {
                    addItemToCart(item, quantity, section.category, section.category);
                  }}
                  removeItemFromCart={removeItemFromCart}
                  removeButton={true}
                  categoryLimit={section.checkout_limit}
                  categoryName={section.category}
                />
              </Box>
            ));
          })}

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
