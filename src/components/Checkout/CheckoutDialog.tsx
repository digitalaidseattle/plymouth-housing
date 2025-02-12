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
import { UserContext } from '../contexts/UserContext';
import { processGeneralItems, processWelcomeBasket } from './CheckoutAPICalls';
import CategorySection from './CategorySection';

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
  const { user, loggedInUserId } = useContext(UserContext);
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
      // 1. If no user is logged in, throw an error
      if (!loggedInUserId) {
        throw new Error('No valid user (volunteer or admin) found. Cannot checkout.');
      }

      const welcomeBasketItemIds = welcomeBasketData.flatMap(basket => basket.items.map(item => item.id));
      const isWelcomeBasket = allItems.some(item => welcomeBasketItemIds.includes(item.id));
      let data = null;
      if (isWelcomeBasket) {
        // pass "loggedInUserId" to the processWelcomeBasket function
        data = await processWelcomeBasket(user, loggedInUserId, allItems, selectedBuildingCode);
      } else {
        data = await processGeneralItems(user, loggedInUserId, allItems, selectedBuildingCode);
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
          width: '55vw',
          maxHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          borderRadius: '15px',
        },
      }}
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <Box sx={{ width: '80%', paddingTop: '20px', height: '100%' }}>
        <DialogTitle sx={{ padding: '20px 0px 0px 0px' }} id="customized-dialog-title">
          <Typography style={{ fontSize: '1.5rem' }}>Checkout Summary</Typography>
        </DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '15px', marginBottom: '30px' }}>
          <Typography><strong>Building code: </strong>{selectedBuildingCode}</Typography>
          <Typography><strong>Total Items Checked Out: </strong>{allItems.reduce((acc, item) => acc + item.quantity, 0)} / 10 allowed</Typography>
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
          height: '40vh'
        }}>
          {checkoutItems.map((section: CategoryProps) => {
            if (section.categoryCount > 0) {
              return <CategorySection category={section} categoryCheckout={section} addItemToCart={(item, quantity) => {
                addItemToCart(item, quantity, section.category, section.category);
              }} removeItemFromCart={removeItemFromCart} removeButton={true} disabled={false} />
            }
          })}

        </DialogContent>
        <DialogContent sx={{
          padding: '10px',
          textAlign: 'center',
        }}>
          <Typography>{statusMessage}</Typography>
        </DialogContent>
        <DialogActions sx={{ marginTop: 'auto' }}>
          <Button onClick={handleCancel}>Return to Checkout Page</Button>
          <Button onClick={handleConfirm} autoFocus>Confirm</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
