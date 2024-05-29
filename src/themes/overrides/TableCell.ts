// ==============================|| OVERRIDES - TABLE CELL ||============================== //

import { Theme } from "@mui/material";

export default function TableCell(theme: Theme) {
  return {
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: 12,
          borderColor: theme.palette.divider
        },
        head: {
          fontWeight: 600,
          paddingTop: 20,
          paddingBottom: 20
        }
      }
    }
  };
}
