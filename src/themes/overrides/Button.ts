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
          props: { variant: 'active-primary' },
          style: {
            backgroundColor: theme.palette.primary['900'],
            color: theme.palette.common.white,
            padding: '1rem 0',
            borderRadius: '18px',
            fontSize: '1.25rem',
          },
        },
        {
          props: { variant: 'inactive-primary' },
          style: {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.grey[100],
            padding: '1rem 0',
            borderRadius: '18px',
            fontSize: '1.25rem',
          },
        },
        {
          props: { variant: 'active-secondary' },
          style: {
            background: theme.palette.primary['900'],
            color: theme.palette.primary.contrastText,
            borderRadius: '20px',
            padding: '0.5rem 1rem',
          },
        },
        {
          props: { variant: 'inactive-secondary' },
          style: {
            background: 'transparent',
            border: `1px solid ${theme.palette.text.primary}`,
            color: theme.palette.text.primary,
            borderRadius: '20px',
            padding: '0.5rem 1rem',
          },
        },
      ],
    },
  };
}
