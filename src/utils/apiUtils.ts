/**
 * Extracts a human-readable error message from a failed Response.
 * Tries to parse the JSON body first (DAB returns error details there),
 * then falls back to statusText, status code, or a generic message.
 *
 * Uses response.clone() because the body stream can only be read once.
 */
export async function getErrorMessage(response: Response): Promise<string> {
  let errorMessage: string | undefined;

  try {
    const errorData = await response.clone().json();
    errorMessage = errorData?.error?.message || errorData?.message;
  } catch {
    console.error('Failed to parse error response as JSON.');
  }

  if (!errorMessage) {
    if (response.statusText) {
      errorMessage = response.statusText;
    } else if (typeof response.status === 'number' && response.status > 0) {
      errorMessage = `HTTP ${response.status}`;
    } else {
      errorMessage = 'Request failed';
    }
  }

  return errorMessage;
}
