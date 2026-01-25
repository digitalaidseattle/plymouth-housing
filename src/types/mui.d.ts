import { ButtonProps } from '@mui/material/Button';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    'active-toggle': true;
    'inactive-border': true;
    'active-secondary': true;
    'inactive-gray': true;
  }
}
