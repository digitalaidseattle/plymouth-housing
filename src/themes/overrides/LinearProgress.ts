/**
 *  LinearProgress.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
// ==============================|| OVERRIDES - LINER PROGRESS ||============================== //

export default function LinearProgress() {
  return {
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 100,
        },
        bar: {
          borderRadius: 100,
        },
      },
    },
  };
}
