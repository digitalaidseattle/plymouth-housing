/**
 *  InventoryTable.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, Button, TableSortLabel, Pagination, MenuItem, Select, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { InventoryItem } from '../../types/interfaces.ts';
import SettingsIcon from '@mui/icons-material/Settings';
import { SETTINGS } from '../../types/constants';

interface InventoryTableProps {
  items: InventoryItem[];
  sortDirection: 'asc' | 'desc' | 'original';
  sortColumn: keyof InventoryItem | null;
  handleSort: (column: keyof InventoryItem) => void;
  setAdjustModal: (b: boolean) => void;
  setItemToEdit: (item: InventoryItem) => void;
}

const getAriaSortValue = (
  column: keyof InventoryItem,
  sortColumn: keyof InventoryItem | null,
  sortDirection: string,
): 'ascending' | 'descending' | 'other' => {
  if (sortColumn !== column || sortDirection === 'original') return 'other';
  return sortDirection === 'asc' ? 'ascending' : 'descending';
};

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  sortDirection,
  sortColumn,
  handleSort,
  setAdjustModal,
  setItemToEdit,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(SETTINGS.itemsPerPage);

  useEffect(() => {
    setPage(0);
  }, [items]);

  const paginatedItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderSortableHeader = (
    key: keyof InventoryItem,
    label: string,
    width: string,
    align?: 'center',
  ) => {
    const isActive = sortColumn === key && sortDirection !== 'original';
    return (
      <TableCell
        key={key}
        sx={{ fontWeight: 'bold', width, textAlign: align }}
        aria-sort={getAriaSortValue(key, sortColumn, sortDirection)}
        sortDirection={
          isActive ? (sortDirection === 'asc' ? 'asc' : 'desc') : false
        }
      >
        <TableSortLabel
          active={isActive}
          direction={
            isActive ? (sortDirection === 'asc' ? 'asc' : 'desc') : 'asc'
          }
          onClick={() => handleSort(key)}
          sx={
            align === 'center'
              ? { display: 'flex', justifyContent: 'center' }
              : undefined
          }
        >
          {label}
        </TableSortLabel>
      </TableCell>
    );
  };

  return (
    <Box
      id="inventory-container"
      sx={{
        mt: 2,
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TableContainer
        component={Paper}
        sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}
      >
        <Table
          stickyHeader
          sx={{
            tableLayout: 'fixed',
            minWidth: 1150,
            '& .MuiTableCell-root': { px: 1.5 },
          }}
        >
          <TableHead>
            <TableRow sx={{ height: '64px' }}>
              {renderSortableHeader('name', 'Name', '16%')}
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                Description
              </TableCell>
              {renderSortableHeader('type', 'Type', '10%')}
              {renderSortableHeader('category', 'Category', '12%')}
              {renderSortableHeader('status', 'Status', '13%')}
              {renderSortableHeader('quantity', 'Quantity', '9%', 'center')}
              <TableCell
                sx={{ fontWeight: 'bold', width: '10%', textAlign: 'right' }}
              >
                Adjust
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No items to display
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    height: '64px',
                    boxShadow: '0px -1px 0px 0px rgb(212, 212, 212);',
                  }}
                >
                  <TableCell
                    sx={{
                      width: '16%',
                      whiteSpace: 'normal',
                      overflowWrap: 'normal',
                    }}
                  >
                    {row.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '30%',
                      whiteSpace: 'normal',
                      overflowWrap: 'normal',
                    }}
                  >
                    {row.description}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '10%',
                      whiteSpace: 'normal',
                      overflowWrap: 'normal',
                    }}
                  >
                    {row.type}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '12%',
                      whiteSpace: 'normal',
                      overflowWrap: 'normal',
                    }}
                  >
                    {row.category}
                  </TableCell>
                  <TableCell sx={{ width: '13%' }}>
                    <Chip
                      label={row.status}
                      sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        backgroundColor:
                          row.status === 'Out of Stock'
                            ? '#FDECEA'
                            : row.status === 'Low Stock'
                              ? '#FFF9C4'
                              : row.status === 'Needs Review'
                                ? '#fff5e8ff'
                                : '#E6F4EA',
                        color:
                          row.status === 'Out of Stock'
                            ? '#D32F2F'
                            : row.status === 'Low Stock'
                              ? '#6A4E23'
                              : row.status === 'Needs Review'
                                ? '#663C00'
                                : '#357A38',
                        borderRadius: '8px',
                        '& .MuiChip-label': {
                          px: 1,
                          py: 0.5,
                          whiteSpace: 'normal',
                          overflowWrap: 'normal',
                          textAlign: 'center',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '9%',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                    }}
                  >
                    {row.quantity >= 0 ? (
                      row.quantity
                    ) : (
                      <WarningAmberIcon color="warning" />
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '10%',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      textAlign: 'right',
                    }}
                  >
                    <Button
                      aria-label="Override quantity"
                      onClick={() => {
                        setItemToEdit(row);
                        setAdjustModal(true);
                      }}
                    >
                      <SettingsIcon color="secondary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2">Rows per page:</Typography>
          <Select
            variant="standard"
            sx={{
              '&::before': { borderBottom: 'none' },
              '&:hover:not(.Mui-disabled)::before': { borderBottom: 'none' },
            }}
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            MenuProps={{
              anchorOrigin: { vertical: 'top', horizontal: 'left' },
              transformOrigin: { vertical: 'bottom', horizontal: 'left' },
            }}
          >
            {SETTINGS.rowsPerPageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Pagination
          count={Math.max(1, Math.ceil(items.length / rowsPerPage))}
          page={page + 1}
          onChange={(_, newPage) => setPage(newPage - 1)}
        />
      </Box>
    </Box>
  );
};

export default InventoryTable;
