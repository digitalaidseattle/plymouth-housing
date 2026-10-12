// Small text/number helpers used across the UI
export function pluralize(word: string, count: number): string {
  return `${word}${Math.abs(count) !== 1 ? 's' : ''}`;
}

export function withCount(count: number, word: string): string {
  return `${count} ${pluralize(word, count)}`;
}

// Returns '+N' for positive numbers, the number (with '-') for negatives, '0' for zero
export function signNumber(value: number): string {
  if (value > 0) return `+${Math.abs(value)}`;
  return String(value);
}

// Coarse "N minutes ago" label for how long since data was fetched
export function formatAge(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${withCount(minutes, 'minute')} ago`;
  return `${withCount(Math.floor(minutes / 60), 'hour')} ago`;
}

export default { pluralize, withCount, signNumber, formatAge };
