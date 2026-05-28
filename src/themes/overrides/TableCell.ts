// ==============================|| OVERRIDES - TABLE CELL ||============================== //

import { Theme } from '@mui/material';

export default function TableCell(theme: Theme) {
  return {
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: theme.typography.caption.fontSize,
          padding: theme.spacing(1.5),
          borderColor: theme.palette.divider,
        },
        head: {
          fontWeight: 600,
          paddingTop: theme.spacing(2.5),
          paddingBottom: theme.spacing(2.5),
        },
      },
    },
  };
}
