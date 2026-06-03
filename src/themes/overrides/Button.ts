// ==============================|| OVERRIDES - BUTTON ||============================== //

import { Theme } from '@mui/material';

export default function Button(theme: Theme) {
  const disabledStyle = {
    '&.Mui-disabled': {
      backgroundColor: theme.palette.grey[200],
    },
  };

  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          fontWeight: 400,
        },
        contained: {
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.common.black,
          '&:hover': {
            backgroundColor: theme.palette.grey[200],
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.grey[200],
            color: theme.palette.text.disabled,
          },
        },
        text: {
          color: theme.palette.common.black,
          textDecoration: 'underline',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
        outlined: {
          ...disabledStyle,
        },
      },
    },
  };
}
