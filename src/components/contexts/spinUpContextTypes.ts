/**
 *  spinUpContextTypes.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { createContext } from 'react';

export interface SpinUpContextType {
  showDialog: boolean;
  retryCount: number;
  setShowDialog: (show: boolean) => void;
  setRetryCount: (count: number) => void;
}

export const SpinUpContext = createContext<SpinUpContextType | undefined>(undefined);
