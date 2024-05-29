// ==============================|| OVERRIDES - CHECKBOX ||============================== //

import { Theme } from "@mui/material";

export default function Checkbox(theme: Theme) {
  return {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: theme.palette.secondary
        }
      }
    }
  };
}
