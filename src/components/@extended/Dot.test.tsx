
import { render, screen } from '@testing-library/react';
import Dot from './Dot';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

describe('Dot', () => {
  it('should render a dot with the correct color and size', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Dot color="primary" size={10} />
      </ThemeProvider>
    );
    const dot = container.firstChild as HTMLElement;
    const styles = getComputedStyle(dot);
    expect(styles.width).toBe('10px');
    expect(styles.height).toBe('10px');
  });

  it('should render a dot with the default color and size', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Dot color="primary" />
      </ThemeProvider>
    );
    const dot = container.firstChild as HTMLElement;
    const styles = getComputedStyle(dot);
    expect(styles.width).toBe('8px');
    expect(styles.height).toBe('8px');
  });
});
