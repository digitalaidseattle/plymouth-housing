declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string;
    100?: string;
    200?: string;
    400?: string;
    700?: string;
    900?: string;
    darker?: string;
    [key: string]: string | undefined;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
    100?: string;
    200?: string;
    400?: string;
    700?: string;
    900?: string;
    darker?: string;
    [key: string]: string | undefined;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    'active-primary': true;
    'inactive-primary': true;
    'active-secondary': true;
    'inactive-secondary': true;
  }
}
