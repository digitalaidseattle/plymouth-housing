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
import { Volunteer } from '../../types/interfaces';
import SnackbarAlert from '../../pages/authentication/SnackbarAlert';

interface VolunteerTableProps {
  volunteers: Volunteer[];
  nameOrder: 'asc' | 'desc' | 'original';
  onNameOrderToggle: () => void;
  onStatusToggle: (volunteerId: number) => void;
}

const VolunteerTable: React.FC<VolunteerTableProps> = ({
  volunteers,
  nameOrder,
  onNameOrderToggle,
  onStatusToggle,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null,
  );
  const [openPinModal, setOpenPinModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    volunteer: Volunteer,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedVolunteer(volunteer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVolunteer(null);
  };

  const handleStatusToggle = () => {
    if (selectedVolunteer) {
      onStatusToggle(selectedVolunteer.id);
    }
    handleMenuClose();
  };

  const handleShowPin = () => {
    if (selectedVolunteer) {
      if (selectedVolunteer.PIN) {
        setSelectedPin(selectedVolunteer.PIN);
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
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>
              Last Signed In Date
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {volunteers.map((volunteer, index) => (
            <TableRow key={index}>
              <TableCell>{volunteer.name}</TableCell>
              <TableCell>
                <Chip
                  label={volunteer.active ? 'Active' : 'Inactive'}
                  sx={{
                    backgroundColor: volunteer.active ? '#E6F4EA' : '#FDECEA',
                    color: volunteer.active ? '#357A38' : '#D32F2F',
                    borderRadius: '8px',
                    px: 1.5,
                  }}
                />
              </TableCell>
              <TableCell>
                {new Date(volunteer.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {volunteer.last_signed_in
                  ? new Date(volunteer.last_signed_in).toLocaleDateString()
                  : 'None'}
              </TableCell>
              <TableCell>
                <IconButton onClick={(e) => handleMenuOpen(e, volunteer)}>
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
          {selectedVolunteer?.active ? 'Deactivate Role' : 'Activate Role'}
        </MenuItem>
        <MenuItem onClick={handleShowPin}>Show PIN</MenuItem>
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

export default VolunteerTable;
