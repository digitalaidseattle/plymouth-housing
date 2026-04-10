/**
 *  ActiveMenuItemContext.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { ChipProps } from '@mui/material';
import React, { createContext } from 'react';

export type MenuItem = {
  id: string;
  title: string;
  type: string;
  children: MenuItem[];
  url: string;
  target: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  breadcrumbs: boolean;
  disabled: boolean;
  chip: ChipProps;
  state?: Record<string, unknown>;
};

interface MenuItemContextType {
  activeMenuItem: string | null;
  setActiveMenuItem: (menuItem: string | null) => void;
}

export const ActiveMenuItemContext = createContext<MenuItemContextType>({
  activeMenuItem: null,
  setActiveMenuItem: () => {},
});
