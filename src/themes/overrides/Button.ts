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
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          fontWeight: 400,
        },
        contained: {
          ...disabledStyle,
        },
        outlined: {
          ...disabledStyle,
        },
      },
      variants: [
        {
          props: { variant: 'active-toggle' },
          style: {
            backgroundColor: (theme.palette.primary as any)['900'],
            color: theme.palette.common.white,
            padding: '1rem 0.rem',
            borderRadius: '18px',
            size: '1.25rem',
          },
        },
        {
          props: { variant: 'inactive-toggle' },
          style: {
            color: theme.palette.text,
            backgroundColor: theme.palette.grey[100],
            padding: '1rem 0.rem',
            borderRadius: '18px',
            size: '1.25rem',
          },
        },
      ],
    },
  };
}
