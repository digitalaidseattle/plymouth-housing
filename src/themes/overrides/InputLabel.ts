// ==============================|| OVERRIDES - INPUT LABEL ||============================== //

import { Theme } from '@mui/material';

export default function InputLabel(theme: Theme) {
  return {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: theme.palette.grey[600],
        },
        outlined: {
          lineHeight: '0.8em',
          '&.MuiInputLabel-sizeSmall': {
            lineHeight: '1em',
          },
          '&.MuiInputLabel-shrink': {
            background: theme.palette.background.paper,
            padding: `0 ${theme.spacing(1)}`,
            marginLeft: theme.spacing(-0.75),
            lineHeight: '1.4375em',
          },
        },
      },
    },
  };
}
