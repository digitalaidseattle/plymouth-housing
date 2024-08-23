import { useState, useEffect } from 'react';
import dummyData from './data';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';

const Inventory = () => {

  const [data, setData] = useState([]);

  const columns = [
    {
      id: 'item',
      numeric: false,
      disablePadding: true,
      label: 'Item',
    },
    {
      id: 'type',
      numeric: false,
      disablePadding: true,
      label: 'Type',
    },
    {
      id: 'category',
      numeric: false,
      disablePadding: true,
      label: 'Category',
    },
    {
      id: 'inStock',
      numeric: false,
      disablePadding: true,
      label: 'In Stock?',
    },
    {
      id: 'quantity',
      numeric: true,
      disablePadding: true,
      label: 'Quantity',
    },
  ]

  useEffect(() => {
    setData(dummyData);
  }, [])

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              '& td, & th': { borderBottom: '1px solid rgba(224, 224, 224, 1)' }
            }}>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
              />
            </TableCell>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align="left"
              >
                <TableSortLabel
                sx={{ fontWeight: 'bold'}}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                cursor: 'pointer',
                '& td, & th': { borderBottom: '1px solid rgba(224, 224, 224, 1)' }
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                />
              </TableCell>
              <TableCell scope="row" align="left">{row.item}</TableCell>
              <TableCell align="left">{row.type}</TableCell>
              <TableCell align="left">{row.category}</TableCell>
              <TableCell align="left">{row.inStock}</TableCell>
              <TableCell align="left">{row.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default Inventory;