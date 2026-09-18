/**
 *  DrawerFooter/index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { getCategorizedItemsTimestamp } from '../../../../services/itemsService';
import { withCount } from '../../../../utils/textUtils';

// ==============================|| DRAWER FOOTER ||============================== //

const TICK_INTERVAL = 30 * 1000;

const formatAge = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${withCount(minutes, 'minute')} ago`;
  return `${withCount(Math.floor(minutes / 60), 'hour')} ago`;
};

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
    return () => window.clearInterval(interval);
  }, []);

  return (
    <Box sx={{ mt: 'auto', px: 3, py: 2 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
};

export default DrawerFooter;
