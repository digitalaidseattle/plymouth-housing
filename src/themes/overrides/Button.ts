/**
 *  Button.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
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
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
        outlined: {
          ...disabledStyle,
        },
      },
      // MUI v9 removed combined slots like `containedPrimary`; the contained +
      // primary dark-gray style must now be expressed via the `variants` API.
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: theme.palette.grey[700],
            color: theme.palette.grey[100],
            '&:hover': {
              backgroundColor: theme.palette.grey[800],
            },
          },
        },
      ],
    },
  };
}

