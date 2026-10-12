/**
 *  ButtonGroup.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
// ==============================|| OVERRIDES - BUTTON GROUP ||============================== //

import { Theme } from '@mui/material';

export default function ButtonGroup(theme: Theme) {
  // The divider between grouped buttons defaults to the primary colour; the
  // app's controls are grey, so tint it to match every other border.
  const dividerStyle = { borderColor: theme.palette.grey[300] };

  return {
    MuiButtonGroup: {
      styleOverrides: {
        firstButton: dividerStyle,
        middleButton: dividerStyle,
      },
    },
  };
}
