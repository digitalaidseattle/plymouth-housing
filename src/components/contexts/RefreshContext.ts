/**
 *  RefreshContext.ts
 *
 *  Method to broadcast an refresh signal.
 *  Combining with useInterval creates a central polling mechanism
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { createContext } from 'react';

interface RefreshContextType {
  refresh: number;
  setRefresh: (refresh: number) => void;
}

export const RefreshContext = createContext<RefreshContextType>({
  refresh: 0,
  setRefresh: () => {},
});
