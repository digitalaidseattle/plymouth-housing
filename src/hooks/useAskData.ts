/**
 *  useAskData.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState } from 'react';
import { AskDataAnswer } from '../types/interfaces';
import { askData } from '../services/askDataService';

export function useAskData() {
  const [answer, setAnswer] = useState<AskDataAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setAnswer(null);
    setError('');
  };

  const ask = async (question: string) => {
    setIsLoading(true);
    setError('');
    try {
      setAnswer(await askData(question));
    } catch (caught) {
      setAnswer(null);
      setError(
        caught instanceof Error ? caught.message : 'Something went wrong.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { answer, isLoading, error, ask, reset };
}
