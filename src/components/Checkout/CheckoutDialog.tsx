import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { CategoryProps, CheckoutItemProp } from '../../types/interfaces';
import { UserContext } from '../contexts/UserContext';
import { processGeneralItems, processWelcomeBasket } from './CheckoutAPICalls';
import CategorySection from './CategorySection';

type CheckoutDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  checkoutItems: CategoryProps[];
  welcomeBasketData: CategoryProps[];
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  addItemToCart: (item: CheckoutItemProp, quantity: number, category: string, active: string) => void;
  setCheckoutItems: (items: CategoryProps[]) => void;
  selectedBuildingCode: string;
  setActiveSection: (s: string) => void;
  fetchData: () => void;
  setSelectedBuildingCode: (building: string) => void;
  activeSection: string;
};

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ open, onClose, checkoutItems, welcomeBasketData, setCheckoutItems, removeItemFromCart, addItemToCart, selectedBuildingCode, setActiveSection, fetchData, setSelectedBuildingCode, onSuccess, activeSection }) => {
  const { user, loggedInUserId } = useContext(UserContext);
  const [originalCheckoutItems, setOriginalCheckoutItems] = useState<CategoryProps[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [allItems, setAllItems] = useState<CheckoutItemProp[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    try {
      if (!loggedInUserId) {
        throw new Error('No valid user (volunteer or admin) found. Cannot checkout.');
      }

      const welcomeBasketItemIds = welcomeBasketData.flatMap(basket => basket.items.map(item => item.id));
      const isWelcomeBasket = allItems.some(item => welcomeBasketItemIds.includes(item.id));
      let data = null;
      if (isWelcomeBasket) {
        data = await processWelcomeBasket(user, loggedInUserId, allItems, selectedBuildingCode);
      } else {
        data = await processGeneralItems(user, loggedInUserId, allItems, selectedBuildingCode);
      }

      if (data.error){
        throw new Error(`status: ${data.error.status}, message: ${data.error.message}`);
      }

      const result = data.value[0];
      if (result.Status === 'Success') {
        setActiveSection('');
        setSelectedBuildingCode('');
        fetchData();
        setStatusMessage('Transaction Successful');
        onClose();
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      setStatusMessage('Transaction failed: ' + error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          width: { xs: '80vw', md: '65vw' },
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
      <Box sx={{ width: { xs: '90%', s: '80%', md: '70%' }, paddingTop: '20px', height: '100%', position: 'relative' }}>
        {isProcessing && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <DialogTitle sx={{ padding: '20px 0px 0px 0px' }} id="customized-dialog-title">
          <Typography sx={{ fontSize: '1.5rem' }}>Checkout Summary</Typography>
        </DialogTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '15px', marginBottom: '30px' }}>
          <Typography><strong>Building code: </strong>{selectedBuildingCode}</Typography>
          <Typography><strong>Total Items Checked Out: </strong>{allItems.reduce((acc, item) => acc + item.quantity, 0)} / 10 allowed</Typography>
        </Box>
        <DialogContent dividers sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 20px',
          height: '40vh',
          borderTop: 'none',
        }}>
          {checkoutItems.map((section: CategoryProps) => {
            if (section.categoryCount > 0) {
              return <CategorySection key={section.id} category={section} categoryCheckout={section} addItemToCart={(item, quantity) => {
                addItemToCart(item, quantity, section.category, section.category);
              }} removeItemFromCart={removeItemFromCart} removeButton={true} disabled={false} activeSection={activeSection} />
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
          <Button
            onClick={handleCancel}
            sx={{
            color: 'black', textDecoration: 'underline'
            }}>Return to Checkout Page</Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            sx={{
              color: 'black',
              backgroundColor: '#F2F2F2',
              '&.Mui-disabled': {
                backgroundColor: '#E0E0E0',
                color: '#757575'
              }
            }}
          >
            {isProcessing ? 'Working...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
