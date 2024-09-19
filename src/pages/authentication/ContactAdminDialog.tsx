import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

interface ContactAdminDialogProps {
  open: boolean;
  onClose: () => void;
}

const ContactAdminDialog: React.FC<ContactAdminDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Forget your PIN?</DialogTitle>
      <DialogContent>
        <Typography>
          Please call the phone number {import.meta.env.VITE_ADMIN_PHONE_NUMBER} or email {import.meta.env.VITE_ADMIN_EMAIL} of a PH admin who can assist you.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactAdminDialog;