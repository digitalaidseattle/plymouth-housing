/**
 *  DrawerFooter/index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { Box, Typography } from '@mui/material';

// ==============================|| DRAWER HEADER ||============================== //

const DrawerFooter = () => {
  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="caption" color="textSecondary">
        Version: {APP_VERSION}
      </Typography>
    </Box>
  );
};

export default DrawerFooter;
