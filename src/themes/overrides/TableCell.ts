// ==============================|| OVERRIDES - TABLE CELL ||============================== //

import { Theme } from '@mui/material';

export default function TableCell(theme: Theme) {
  return {
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: theme.typography.caption.fontSize,
          padding: 12,
          borderColor: theme.palette.divider,
        },
        head: {
          fontWeight: 600,
          paddingTop: 20,
          paddingBottom: 20,
        },
      },
    },
  };
}
