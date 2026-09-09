/**
 *  DrawerOpenContext.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { createContext } from 'react';
import { DrawerOpenContextType } from '../../types/interfaces';

export const DrawerOpenContext = createContext<DrawerOpenContextType>({
  drawerOpen: false,
  setDrawerOpen: () => {},
});
