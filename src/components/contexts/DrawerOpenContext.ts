/**
 *  DrawerOpenContext.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { createContext } from "react";

interface DrawerOpenContextType {
    drawerOpen: boolean,
    setDrawerOpen: (open: boolean) => void
}

export const DrawerOpenContext = createContext<DrawerOpenContextType>({
    drawerOpen: false,
    setDrawerOpen: () => {}
});

