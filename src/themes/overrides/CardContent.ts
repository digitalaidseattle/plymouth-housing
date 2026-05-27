/**
 *  CardContent.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
// ==============================|| OVERRIDES - CARD CONTENT ||============================== //

export default function CardContent() {
  return {
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
  };
}
