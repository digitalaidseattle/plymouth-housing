/**
 *  RefreshContext.ts
 *
 *  Method to broadcast an refresh signal.
 *  Combining with useInterval creates a central polling mechanism
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { ReactNode, useState } from 'react';
import { useInterval } from '../../hooks/useInterval';
import { RefreshContext } from './RefreshContext';

export const RefreshContextProvider = (props: { children: ReactNode }) => {
  const [refresh, setRefresh] = useState(Date.now());
  // Polling, 75% think it is worthwhile
  useInterval(() => {
    setRefresh(Date.now());
  }, 1000 * 10);

  return (
    <RefreshContext.Provider value={{ refresh, setRefresh }}>
      {props.children}
    </RefreshContext.Provider>
  );
};
