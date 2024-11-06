import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CheckoutItem } from '../../types/interfaces'

type CheckoutDialogProps = {
  open: boolean;
  onClose: () => void;
  checkoutItems: CheckoutItem[];
  removeItemFromCart: (itemId: string) => void;
  renderItemQuantityButtons: (item: CheckoutItem) => JSX.Element;
};

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  checkoutItems,
  removeItemFromCart,
  renderItemQuantityButtons,
}) => {
  return (
    <Dialog onClose={onClose} aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        <span style={{ fontSize: "1.5rem" }}>Checkout Summary</span>
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
      <DialogContent dividers style={{ width: "500px" }}>
        {checkoutItems.map((item: CheckoutItem) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "370px", alignItems: "center" }}>
              <div>
                <h4>{item.name}</h4>
              </div>
              {renderItemQuantityButtons(item)}
            </div>
            <div>
              <Button variant="text" onClick={() => removeItemFromCart(item.id)}>Remove</Button>
            </div>
          </div>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button autoFocus>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutDialog;
