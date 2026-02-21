// ==============================|| OVERRIDES - TOGGLE BUTTON ||============================== //

import { Theme } from '@mui/material';

export default function ToggleButton(theme: Theme) {
  return {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          border: 'none !important', // Override default MUI border

          // Primary style (for history page checkout/inventory toggle)
          '&.toggle-primary': {
            padding: '1rem 0',
            borderRadius: '18px !important',
            fontSize: '1.25rem',
            backgroundColor: theme.palette.grey[100],
            color: theme.palette.text.primary,
            minWidth: '120px',

            '&.Mui-selected': {
              backgroundColor: `${theme.palette.primary.dark} !important`,
              color: `${theme.palette.common.white} !important`,

              '&:hover': {
                backgroundColor: `${theme.palette.primary.dark} !important`,
              },
            },

            '&:hover': {
              backgroundColor: theme.palette.grey[200],
            },
          },

          // Secondary style (for date picker preset buttons)
          '&.toggle-secondary': {
            borderRadius: '20px !important',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: `1px solid ${theme.palette.text.primary} !important`,
            color: theme.palette.text.primary,

            '&.Mui-selected': {
              backgroundColor: `${theme.palette.primary.dark} !important`,
              color: `${theme.palette.primary.contrastText} !important`,
              border: 'none !important',

              '&:hover': {
                backgroundColor: `${theme.palette.primary.dark} !important`,
              },
            },

            '&:hover': {
              backgroundColor: theme.palette.grey[100],
            },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: '1rem',
          // Remove default grouped styling
          '& .MuiToggleButton-root': {
            marginLeft: '0 !important',
            borderLeft: 'none !important',
          },
        },
        grouped: {
          '&:not(:first-of-type)': {
            marginLeft: 0,
            borderLeft: 'none',
          },
          '&:not(:last-of-type)': {
            borderRight: 'none',
          },
        },
      },
    },
  };
}
