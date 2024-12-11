/**
 *  RefreshContext.ts
 *
 *  Method to broadcast an refresh signal.
 *  Combining with useInterval creates a central polling mechanism
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { ReactNode, createContext, useState } from 'react';
import { useInterval } from '../../hooks/useInterval';


interface RefreshContextType {
  refresh: number;
  setRefresh: (refresh: number) => void;
}

export const RefreshContext = createContext<RefreshContextType>({
  refresh: 0,
  setRefresh: () => {},
});

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
