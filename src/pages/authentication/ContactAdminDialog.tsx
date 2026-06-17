/**
 *  ContactAdminDialog.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';

interface ContactAdminDialogProps {
  open: boolean;
  onClose: () => void;
}

const ContactAdminDialog: React.FC<ContactAdminDialogProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Forget your PIN?</DialogTitle>
      <DialogContent>
        <Typography>
          Let a staff member know. A PH admin nearby can help.
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
