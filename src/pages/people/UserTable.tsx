import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Box,
  Typography,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';
import { User } from '../../types/interfaces';
import SnackbarAlert from '../../components/SnackbarAlert';

interface UserTableProps {
  users: User[];
  nameOrder: 'asc' | 'desc' | 'original';
  onNameOrderToggle: () => void;
  onStatusToggle: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  nameOrder,
  onNameOrderToggle,
  onStatusToggle,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(
    null,
  );
  const [openPinModal, setOpenPinModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    user: User,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleStatusToggle = () => {
    if (selectedUser) {
      onStatusToggle(selectedUser.id);
    }
    handleMenuClose();
  };

  const handleShowPin = () => {
    if (selectedUser) {
      if (selectedUser.PIN) {
        setSelectedPin(selectedUser.PIN);
        setOpenPinModal(true);
      } else {
        setSnackbarOpen(true);
      }
    }
    handleMenuClose();
  };
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={onNameOrderToggle}
            >
              Name
              {nameOrder === 'asc' ? (
                <ArrowUpwardIcon
                  fontSize="small"
                  sx={{ ml: 0.5, color: 'gray' }}
                />
              ) : nameOrder === 'desc' ? (
                <ArrowDownwardIcon
                  fontSize="small"
                  sx={{ ml: 0.5, color: 'gray' }}
                />
              ) : null}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>
              Last Signed In Date
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={index}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Chip
                  label={user.active ? 'Active' : 'Inactive'}
                  sx={{
                    backgroundColor: user.active ? '#E6F4EA' : '#FDECEA',
                    color: user.active ? '#357A38' : '#D32F2F',
                    borderRadius: '8px',
                    px: 1.5,
                  }}
                />
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {user.last_signed_in
                  ? new Date(user.last_signed_in).toLocaleDateString()
                  : 'None'}
              </TableCell>
              <TableCell>
                <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Menu for actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleStatusToggle}>
          {selectedUser?.active ? 'Deactivate Role' : 'Activate Role'}
        </MenuItem>
        {selectedUser?.role !== 'admin'&&(
        <MenuItem onClick={handleShowPin}>Show PIN</MenuItem>)}
      </Menu>

      {/* PIN Modal */}
      <Modal
        open={openPinModal}
        onClose={() => setOpenPinModal(false)}
        aria-labelledby="pin-modal-title"
        aria-describedby="pin-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            outline: 'none',
            width: 300,
            textAlign: 'center', // Center all text
          }}
        >
          {/* Close Button */}
          <IconButton
            aria-label="close"
            onClick={() => setOpenPinModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography id="pin-modal-title" variant="h6" component="h2">
            Pin code:
          </Typography>
          <Typography id="pin-modal-description" sx={{ mt: 2 }}>
            <strong>{selectedPin}</strong>
          </Typography>
        </Box>
      </Modal>

      <SnackbarAlert
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity="warning"
      >
        'PIN not available.'
      </SnackbarAlert>
    </TableContainer>
  );
};

export default UserTable;
