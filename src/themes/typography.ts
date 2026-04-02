// ==============================|| DEFAULT THEME - TYPOGRAPHY  ||============================== //

const Typography = (fontFamily: string) => ({
  htmlFontSize: '18px',
  fontFamily,

  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,

  h1: {
    fontWeight: 500,
    fontSize: '2.25rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontWeight: 500,
    fontSize: '2rem',
    lineHeight: 1.25,
    letterSpacing: '-0.015em',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.75rem',
    lineHeight: 1.3,
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.35,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.45,
  },

  body1: {
    fontWeight: 400,
    fontSize: '1.125rem',
    lineHeight: 1.6,
  },
  body2: {
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.6,
  },

  subtitle1: {
    fontWeight: 500,
    fontSize: '1.125rem',
    lineHeight: 1.5,
    letterSpacing: '0.015em',
  },
  subtitle2: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0.015em',
  },

  caption: {
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.45,
  },

  overline: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.4,
    letterSpacing: '0.09em',
    textTransform: 'uppercase' as const,
  },

  button: {
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.4,
    textTransform: 'none' as const,
  },
});

export default Typography;
