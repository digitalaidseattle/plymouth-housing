import React, { useEffect, useState } from 'react';
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
import { CheckoutItemProp } from '../../types/interfaces';
import CheckoutCard from './CheckoutCard';

type CheckoutDialogProps = {
  open: boolean;
  onClose: () => void;
  checkoutItems: CheckoutItemProp[];
  removeItemFromCart: (itemId: string) => void;
  addItemToCart: (item: CheckoutItemProp, quantity: number) => void;
  setCheckoutItems: (items: CheckoutItemProp[]) => void;
  // renderItemQuantityButtons: (item: CheckoutItem) => JSX.Element;
};

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  checkoutItems,
  setCheckoutItems,
  removeItemFromCart,
  addItemToCart,
  // renderItemQuantityButtons,
}) => {

  const [originalCheckoutItems, setOriginalCheckoutItems] = useState<CheckoutItemProp[]>([]);

  useEffect(() => {
    if (open) {
      setOriginalCheckoutItems([...checkoutItems]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);


  const handleCancel = () => {
    setCheckoutItems(originalCheckoutItems);
    onClose();
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          width: '70vh', // Custom width
          height: '70vh', // Custom height
          maxWidth: '90vw', // Ensure responsiveness
          maxHeight: '90vh', // Prevent it from overflowing the screen
        },
      }}
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        <Typography style={{ fontSize: '1.5rem' }}>Checkout Summary</Typography>
      </DialogTitle>
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
      <DialogContent dividers sx={{ width: '100%', overflowY: 'auto' }}>
        {checkoutItems.map((item: CheckoutItemProp) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <CheckoutCard item={item} checkoutItems={checkoutItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} removeButton={true} />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button autoFocus>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutDialog;
