/**
 *  askDataService.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { ENDPOINTS } from '../types/constants';
import { AskDataAnswer } from '../types/interfaces';

// Not apiRequest: that retries 5xx twenty times for the SQL spin-up path and
// unwraps DAB's { value } envelope, neither of which applies to a Function.
export async function askData(question: string): Promise<AskDataAnswer> {
  const response = await fetch(ENDPOINTS.ASK_DATA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // The rejected query comes back so the user can see what was refused.
    throw new Error(
      [body?.error ?? 'Could not reach the assistant.', body?.sql]
        .filter(Boolean)
        .join('\n\n'),
    );
  }
  return body as AskDataAnswer;
}
