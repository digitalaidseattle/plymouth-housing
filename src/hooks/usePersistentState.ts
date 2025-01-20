/**
 *  /hooks/usePersistentState.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { useState } from 'react';

function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : initialValue;
      } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return initialValue;
      }
    });

  const setPersistentState = (value: T) => {
    setState(value);
    try {
        if (value === null || (Array.isArray(value) && value.length === 0)) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    };

  return [state, setPersistentState];
}

export default usePersistentState;
