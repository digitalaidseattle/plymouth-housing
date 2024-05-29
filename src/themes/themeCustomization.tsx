import { ReactNode, useMemo } from 'react';

// material-ui
import {
  Components,
  CssBaseline,
  StyledEngineProvider,
  ThemeOptions,
  ThemeProvider,
  createTheme
} from '@mui/material';

// project import
import componentsOverride from './overrides';
import Palette from './palette';
import CustomShadows from './shadows';
import Typography from './typography';

// ==============================|| DEFAULT THEME - MAIN  ||============================== //

export default function ThemeCustomization(props: { children: ReactNode }) {
  // const theme = Palette('light', 'default');
  const theme = Palette('light');

  const themeTypography = Typography(`'Public Sans', sans-serif`);
  const themeCustomShadows = useMemo(() => CustomShadows(theme), [theme]);

  const themeOptions = useMemo(
    () => ({
      breakpoints: {
        values: {
          xs: 0,
          sm: 768,
          md: 1024,
          lg: 1266,
          xl: 1536
        }
      },
      direction: 'ltr',
      mixins: {
        toolbar: {
          minHeight: 60,
          paddingTop: 8,
          paddingBottom: 8
        }
      },
      palette: theme.palette,
      customShadows: themeCustomShadows,
      typography: themeTypography
    }),
    [theme, themeTypography, themeCustomShadows]
  );

  const themes = createTheme(themeOptions as ThemeOptions);
  themes.components = componentsOverride(themes) as Components;

  return (
    <>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={themes}>
          <CssBaseline />
          {props.children}
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
}
