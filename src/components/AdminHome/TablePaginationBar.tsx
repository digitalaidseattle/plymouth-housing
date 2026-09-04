/**
 *  TablePaginationBar.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, MenuItem, Pagination, Select, Typography } from '@mui/material';
import { SETTINGS } from '../../types/constants';

interface TablePaginationBarProps {
  rowCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const selectSx = {
  '&::before': { borderBottom: 'none' },
  '&:hover:not(.Mui-disabled)::before': { borderBottom: 'none' },
};

// `page` is zero-based here, converted for MUI's one-based Pagination.
const TablePaginationBar: React.FC<TablePaginationBarProps> = ({
  rowCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">Rows per page:</Typography>
      <Select
        variant="standard"
        sx={selectSx}
        value={rowsPerPage}
        onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
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
      count={Math.max(1, Math.ceil(rowCount / rowsPerPage))}
      page={page + 1}
      onChange={(_, newPage) => onPageChange(newPage - 1)}
    />
  </Box>
);

export default TablePaginationBar;
