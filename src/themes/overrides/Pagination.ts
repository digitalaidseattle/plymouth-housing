/**
 *  Pagination.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
// ==============================|| OVERRIDES - PAGINATION ||============================== //

import { Theme } from '@mui/material';

// Enlarge pager hit targets to ~44px (WCAG 2.5.5) so they are comfortable to tap
// on a tablet. Text and icons keep their defaults, and MUI's built-in item spacing
// is left as-is. Applies to every <Pagination> (People, Inventory) and the Catalog
// <TablePagination>.
export default function Pagination(theme: Theme) {
  return {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          minWidth: theme.spacing(5.5),
          height: theme.spacing(5.5),
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        actions: {
          '& .MuiIconButton-root': {
            width: theme.spacing(5.5),
            height: theme.spacing(5.5),
          },
        },
      },
    },
  };
}