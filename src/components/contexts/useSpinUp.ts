/**
 *  useSpinUp.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useContext } from 'react';
import { SpinUpContext } from './spinUpContext';

export const useSpinUp = () => {
  return useContext(SpinUpContext);
};
