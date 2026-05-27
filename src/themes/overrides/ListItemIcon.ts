/**
 *  ListItemIcon.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
// ==============================|| OVERRIDES - LIST ITEM ICON ||============================== //

export default function ListItemIcon() {
  return {
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 24,
        },
      },
    },
  };
}
