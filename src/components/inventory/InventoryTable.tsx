import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tooltip, Box } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { InventoryItem } from '../../types/interfaces.ts';

interface InventoryTableProps {
  currentItems: InventoryItem[];
  sortDirection: 'asc' | 'desc' | 'original';
  handleSort: () => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ currentItems, sortDirection, handleSort }) => {

  if (!currentItems?.length) {
    return <Box>No items to display</Box>;
  }

  return (
    <Box id="inventory-container" sx={{ marginY: '10px' }}>
      <TableContainer component={Paper}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  width: '20%',
                }}
                onClick={handleSort}
              >
                Name
                {sortDirection === 'asc' ? (
                  <ArrowUpwardIcon fontSize="small" sx={{ fontWeight: 'normal', ml: 0.5, color: 'gray' }} />
                ) : sortDirection === 'desc' ? (
                  <ArrowDownwardIcon fontSize="small" sx={{ fontWeight: 'normal', ml: 0.5, color: 'gray' }} />
                ) : null}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '12.5%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '12.5%' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '12.5%' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '12.5%' }}>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.map((row, index) => (
              <TableRow
                key={index}
                component={Paper}
                sx={{
                  boxShadow:
                    '0px 3px 6px rgba(0, 0, 0, 0.1), 0px 1px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                <TableCell sx={{ width: '20%' }}>{row.name}</TableCell>
                <TableCell sx={{
                  width: '30%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}>
                  <Tooltip title={row.description} arrow>
                    <span>{row.description}</span>
                  </Tooltip>
                </TableCell>

                <TableCell sx={{ width: '12,5%' }}>{row.type}</TableCell>
                <TableCell sx={{ width: '12.5%' }}>{row.category}</TableCell>
                <TableCell sx={{ width: '12.5%' }}>
                  <Chip
                    label={row.status}
                    sx={{
                      backgroundColor: row.status === 'Low' ? '#FDECEA' : row.status === 'Medium' ? '#FFF9C4' : '#E6F4EA',
                      color: row.status === 'Low' ? '#D32F2F' : row.status === 'Medium' ? '#6A4E23' : '#357A38',
                      borderRadius: '8px',
                      px: 1.5,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ width: '12.5%' }}>{row.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryTable;
