/**
 * A custom hook that manages user inactivity tracking and triggers a callback after a specified timeout.
 */

import { useEffect, useRef, useCallback } from 'react';

interface InactivityTimerProps {
  onInactivity: () => void;
  timeout: number;
}

export const useInactivityTimer = ({ onInactivity, timeout }: InactivityTimerProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(onInactivity, timeout);
  }, [onInactivity, timeout]);

  useEffect(() => {
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activities.forEach(activity => {
      document.addEventListener(activity, resetTimer);
    });

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activities.forEach(activity => {
        document.removeEventListener(activity, resetTimer);
      });
    };
  }, [resetTimer]);

  return resetTimer;
};