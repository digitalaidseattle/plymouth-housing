import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Volunteer } from '../../types/interfaces';

interface VolunteerTableProps {
  volunteers: Volunteer[];
  nameOrder: 'asc' | 'desc' | 'original';
  onNameOrderToggle: () => void;
}

const VolunteerTable: React.FC<VolunteerTableProps> = ({ volunteers, nameOrder, onNameOrderToggle }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={onNameOrderToggle}
            >
              Name
              {nameOrder === 'asc' ? (
                <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5, color: 'gray' }} />
              ) : nameOrder === 'desc' ? (
                <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5, color: 'gray' }} />
              ) : null}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date Created</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Last Signed In Date</TableCell>
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
              <TableCell>{new Date(volunteer.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {volunteer.last_signed_in
                  ? new Date(volunteer.last_signed_in).toLocaleDateString()
                  : 'None'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VolunteerTable;
