/**
 *  DrawerFooter/index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  CATEGORIZED_ITEMS_UPDATED,
  getCategorizedItemsTimestamp,
} from '../../../../services/itemsService';
import { formatAge } from '../../../../utils/textUtils';

// ==============================|| DRAWER FOOTER ||============================== //

const TICK_INTERVAL = 30 * 1000;

const inventoryLabel = (): string => {
  const cachedAt = getCategorizedItemsTimestamp();
  if (cachedAt === null) return 'Inventory not loaded yet';
  return `Inventory updated ${formatAge(Date.now() - cachedAt)}`;
};

const DrawerFooter = () => {
  const [label, setLabel] = useState<string>(inventoryLabel);

  useEffect(() => {
    const update = () => setLabel(inventoryLabel());
    update();
    const interval = window.setInterval(update, TICK_INTERVAL);
    window.addEventListener(CATEGORIZED_ITEMS_UPDATED, update);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(CATEGORIZED_ITEMS_UPDATED, update);
    };
  }, []);

  return (
    <Box
      sx={{
        mt: 'auto',
        pl: '28px',
        pr: 2,
        py: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="caption"
        component="p"
        sx={{ color: 'text.secondary', whiteSpace: 'normal' }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default DrawerFooter;
