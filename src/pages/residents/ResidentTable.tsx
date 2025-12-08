import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { ResidentWithUnit } from '../../types/interfaces';

interface ResidentTableProps {
  residents: ResidentWithUnit[];
  nameOrder: 'asc' | 'desc' | 'original';
  onNameOrderToggle: () => void;
  onEditResident: (resident: ResidentWithUnit) => void;
}

const ResidentTable: React.FC<ResidentTableProps> = ({
  residents,
  nameOrder,
  onNameOrderToggle,
  onEditResident,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedResident, setSelectedResident] = useState<ResidentWithUnit | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    resident: ResidentWithUnit,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedResident(resident);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedResident(null);
  };

  const handleEdit = () => {
    if (selectedResident) {
      onEditResident(selectedResident);
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
            <TableCell sx={{ fontWeight: 'bold' }}>Building Code</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Unit Number</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {residents.map((resident, index) => (
            <TableRow key={index}>
              <TableCell>{resident.name}</TableCell>
              <TableCell>{resident.building_code}</TableCell>
              <TableCell>{resident.unit_number}</TableCell>
              <TableCell>
                <IconButton aria-label="more" onClick={(e) => handleMenuOpen(e, resident)}>
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
        <MenuItem onClick={handleEdit}>Edit Resident</MenuItem>
      </Menu>
    </TableContainer>
  );
};

export default ResidentTable;
