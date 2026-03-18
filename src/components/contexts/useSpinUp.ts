/**
 *  useSpinUp.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { useContext } from 'react';
import { SpinUpContext } from './spinUpContextTypes';

export const useSpinUp = () => {
  return useContext(SpinUpContext);
};
