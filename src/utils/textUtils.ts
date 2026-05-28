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

export default { pluralize, withCount, signNumber };
