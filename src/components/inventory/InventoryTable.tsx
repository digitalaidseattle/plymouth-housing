import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tooltip, Box, Button } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { InventoryItem } from '../../types/interfaces.ts';
import SettingsIcon from '@mui/icons-material/Settings';

interface InventoryTableProps {
  currentItems: InventoryItem[];
  sortDirection: 'asc' | 'desc' | 'original';
  sortColumn: keyof InventoryItem | null;
  handleSort: (column: keyof InventoryItem) => void;
  setAdjustModal: (b: boolean) => void;
  setItemToEdit: (item: InventoryItem) => void;
}

const SortIcon: React.FC<{ column: keyof InventoryItem; sortColumn: keyof InventoryItem | null; sortDirection: string }> = ({ column, sortColumn, sortDirection }) => {
  if (sortColumn !== column) return null;
  if (sortDirection === 'asc') {
    return <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5, color: 'gray' }} />;
  }
  if (sortDirection === 'desc') {
    return <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5, color: 'gray' }} />;
  }
  return null;
};

const sortableHeaderSx = {
  fontWeight: 'bold',
  cursor: 'pointer',
  userSelect: 'none' as const,
};

const InventoryTable: React.FC<InventoryTableProps> = ({ currentItems, sortDirection, sortColumn, handleSort, setAdjustModal, setItemToEdit }) => {

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
                  ...sortableHeaderSx,
                  display: 'flex',
                  alignItems: 'center',
                  width: '25%',
                }}
                onClick={() => handleSort('name')}
              >
                Name
                <SortIcon column="name" sortColumn={sortColumn} sortDirection={sortDirection} />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Description</TableCell>
              <TableCell
                sx={{ ...sortableHeaderSx, width: '12.5%' }}
                onClick={() => handleSort('type')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Type
                  <SortIcon column="type" sortColumn={sortColumn} sortDirection={sortDirection} />
                </Box>
              </TableCell>
              <TableCell
                sx={{ ...sortableHeaderSx, width: '12.5%' }}
                onClick={() => handleSort('category')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Category
                  <SortIcon column="category" sortColumn={sortColumn} sortDirection={sortDirection} />
                </Box>
              </TableCell>
              <TableCell
                sx={{ ...sortableHeaderSx, width: '12.5%' }}
                onClick={() => handleSort('status')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Status
                  <SortIcon column="status" sortColumn={sortColumn} sortDirection={sortDirection} />
                </Box>
              </TableCell>
              <TableCell
                sx={{ ...sortableHeaderSx, width: '12.5%', textAlign: 'center' }}
                onClick={() => handleSort('quantity')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Quantity
                  <SortIcon column="quantity" sortColumn={sortColumn} sortDirection={sortDirection} />
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', paddingRight: '2rem' }}>Adjust</TableCell>
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
                <TableCell sx={{ width: '12.5%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textAlign: 'center' }}>
                  {row.quantity >= 0 ? row.quantity : <WarningAmberIcon color="warning"/>}
                </TableCell>
                <TableCell sx={{ width: '12.5%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textAlign: 'right' }}>
                  <Button
                    aria-label="Override quantity"
                    onClick={()=>{
                      setItemToEdit(row)
                      setAdjustModal(true)
                  }}>
                    <SettingsIcon color="secondary"/>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryTable;
