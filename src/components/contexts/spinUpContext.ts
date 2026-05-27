/**
 *  spinUpContextTypes.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { createContext } from 'react';
import { SpinUpContextType } from '../../types/interfaces';

export const SpinUpContext = createContext<SpinUpContextType | undefined>(undefined);
