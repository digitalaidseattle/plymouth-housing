// ==============================|| OVERRIDES - CARD CONTENT ||============================== //

import { Theme } from '@mui/material';

export default function CardContent(theme: Theme) {
  return {
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2.5),
          '&:last-child': {
            paddingBottom: theme.spacing(2.5),
          },
        },
      },
    },
  };
}
