/**
 *  SpinUpContext.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import SpinUpDialog from '../../pages/authentication/SpinUpDialog';
import { setSpinUpCallbacks } from '../../services/apiRequest';
import { SpinUpContext } from './spinUpContext';

interface SpinUpProviderProps {
  children: ReactNode;
}

export const SpinUpProvider: React.FC<SpinUpProviderProps> = ({ children }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Register callbacks with apiRequest on mount
  useEffect(() => {
    setSpinUpCallbacks(setShowDialog, setRetryCount);
  }, []);

  const contextValue = useMemo(
    () => ({
      showDialog,
      retryCount,
      setShowDialog,
      setRetryCount,
    }),
    [showDialog, retryCount]
  );

  return (
    <SpinUpContext.Provider value={contextValue}>
      {children}
      <SpinUpDialog open={showDialog} retryCount={retryCount} />
    </SpinUpContext.Provider>
  );
};
