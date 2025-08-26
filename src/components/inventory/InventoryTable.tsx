import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tooltip, Box } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { InventoryItem } from '../../types/interfaces.ts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';

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
    <Box id="inventory-container" sx={{ marginTop: '10px'}}>
      <TableContainer component={Paper}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ height: '64px' }}>
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
                sx={{
                  height: '64px',
                  boxShadow:
                  '0px -1px 0px 0px rgb(212, 212, 212);',
                }}
              >
                <TableCell sx={{
                  width: '20%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{row.name}</TableCell>
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

                <TableCell sx={{ width: '12,5%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{row.type}</TableCell>
                <TableCell sx={{ width: '12.5%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{row.category}</TableCell>
                <TableCell sx={{ width: '12.5%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <Chip
                    label={row.status}
                    sx={{
                      backgroundColor: row.status === 'Out of Stock' ? '#FDECEA' 
                        : row.status === 'Low Stock' ? '#FFF9C4' 
                        : row.status === 'Needs Review' ? '#fff5e8ff'
                        : '#E6F4EA',
                      color: row.status === 'Out of Stock' ? '#D32F2F' 
                        : row.status === 'Low Stock' ? '#6A4E23' 
                        : row.status === 'Needs Review' ? '#663C00'
                        : '#357A38',
                      borderRadius: '8px',
                      px: 1.5,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ width: '12.5%', textAlign: 'center' }}>{row.quantity >= 0 ? row.quantity : <WarningAmberIcon color="warning"/>}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{row.quantity < 0 && <BuildOutlinedIcon sx={{ padding: '0.125rem' }}/>}<MoreVertIcon color="secondary"/></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryTable;
